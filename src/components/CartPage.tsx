import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '../types/cart';
import { Package, Truck, ArrowLeft, Image as ImageIcon, PhoneCall, UploadCloud, Check, Sparkles, Box, Headset, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMarket } from '../context/MarketContext';
import { GiftBoxStyle, getStoredGiftBoxes } from '../data/giftsData';
import { formatPrice } from '../utils/currency';
import { GiftNotePreview } from './GiftNotePreview';
import { supabase } from '../lib/supabase';

interface CartPageProps {
  session: any;
  items: CartItem[];
  orders?: Order[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: Order) => void;
  onNavigate?: (path: string) => void;
}

interface CartFormDraft {
  phone?: string;
  address?: string;
  city?: string;
  recipientName?: string;
  senderName?: string;
  giftMessage?: string;
  selectedBoxId?: string;
  shipMode?: 'recipient' | 'me';
}

const getSavedDraft = (): CartFormDraft => {
  try {
    const raw = localStorage.getItem('mbm_cart_form_draft');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const CartPage: React.FC<CartPageProps> = ({
  session,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const { buyerMarket, currency } = useMarket();

  // Load saved draft so customer never loses filled details upon login/signup
  const draft = getSavedDraft();

  // Custom Box Detail toggles
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Gift Box Styles State — start empty; only populated from DB
  const [giftBoxes, setGiftBoxes] = useState<GiftBoxStyle[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string>(draft.selectedBoxId || '');

  useEffect(() => {
    getStoredGiftBoxes().then((boxes) => {
      if (boxes && boxes.length > 0) {
        setGiftBoxes(boxes);
        setSelectedBoxId((prev) => prev || boxes[0].id);
      }
      // If DB returns nothing → leave giftBoxes empty → section is hidden
    });
  }, []);

  const getBoxPrice = (box?: GiftBoxStyle): number => {
    if (!box) return 0;
    if (buyerMarket === 'INTERNATIONAL') {
      if (box.price_usd != null && box.price_usd > 0) return box.price_usd;
      return Math.round((box.price / 120) * 100) / 100;
    }
    return box.price;
  };

  const hasCustomItems = items.some((item) => item.type === 'custom');
  const selectedBox = hasCustomItems ? (giftBoxes.find((b) => b.id === selectedBoxId) || giftBoxes[0]) : undefined;
  const wrapTier = hasCustomItems && selectedBox ? getBoxPrice(selectedBox) : 0;
  const [shipMode, setShipMode] = useState<'recipient' | 'me'>(draft.shipMode || 'recipient');

  const [phone, setPhone] = useState(draft.phone || '');
  const [address, setAddress] = useState(draft.address || '');
  const [city, setCity] = useState(draft.city || '');
  const [recipientName, setRecipientName] = useState(draft.recipientName || '');
  const [senderName, setSenderName] = useState(draft.senderName || '');
  const [giftMessage, setGiftMessage] = useState(draft.giftMessage || '');
  const [validationError, setValidationError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Auto-save form draft so details survive page reload, auth redirects, or back navigation
  useEffect(() => {
    try {
      localStorage.setItem(
        'mbm_cart_form_draft',
        JSON.stringify({
          phone,
          address,
          city,
          recipientName,
          senderName,
          giftMessage,
          selectedBoxId,
          shipMode,
        })
      );
    } catch {}
  }, [phone, address, city, recipientName, senderName, giftMessage, selectedBoxId, shipMode]);

  // Cart Calculations
  const calculateItemPrice = (item: CartItem): number => {
    if (item.type === 'package') {
      const price = buyerMarket === 'INTERNATIONAL'
        ? (item.package.price_usd != null && item.package.price_usd > 0 ? item.package.price_usd : Math.round((item.package.price / 120) * 100) / 100)
        : item.package.price;
      return price * item.quantity;
    } else {
      if (buyerMarket === 'INTERNATIONAL') {
        const subItemsTotal = item.selectedItems.reduce((sum, si) => {
          const p = si.price_usd != null && si.price_usd > 0 ? si.price_usd : Math.round((si.price / 120) * 100) / 100;
          return sum + p;
        }, 0);
        return subItemsTotal * item.quantity;
      }
      return item.totalPrice * item.quantity;
    }
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const total = subtotal + wrapTier;

  const handlePlaceOrder = async () => {
    setValidationError('');
    if (items.length === 0) return;

    // Force signup/login before placing order — form data is already stored in draft
    if (!session) {
      if (onNavigate) {
        onNavigate('/login?redirect=/cart');
      } else {
        window.location.href = '/login?redirect=/cart';
      }
      return;
    }

    // Mandatory Field Validation
    if (!phone.trim()) {
      setValidationError('Please provide your phone number so our team can confirm your order.');
      return;
    }

    if (!address.trim()) {
      setValidationError('Please provide your delivery address or location.');
      return;
    }

    setIsPlacingOrder(true);

    // ─── Backend market & price validation ──────────────────────────────────
    // Call the Supabase Edge Function to re-derive market from the user profile
    // and recompute the total server-side. This prevents frontend manipulation.
    let serverValidatedTotal = total;
    let serverValidatedMarket = buyerMarket;
    let serverValidatedCurrency = currency;

    try {
      const authSession = session || (await supabase.auth.getSession()).data.session;
      if (authSession?.access_token) {
        const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
        const cartPayload = {
          cart_items: items.map(item => ({
            type: item.type,
            id: item.type === 'package' ? item.package.id : item.id,
            quantity: item.quantity,
          })),
          box_id: selectedBox?.id || null,
          claimed_market: buyerMarket,
        };

        const edgeFnRes = await fetch(
          `${supabaseUrl}/functions/v1/validate-market-order`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authSession.access_token}`,
            },
            body: JSON.stringify(cartPayload),
            signal: AbortSignal.timeout(8000),
          }
        );

        if (edgeFnRes.ok) {
          const validated = await edgeFnRes.json();
          if (validated?.validated_total > 0) {
            serverValidatedTotal = validated.validated_total;
            serverValidatedMarket = validated.market || buyerMarket;
            serverValidatedCurrency = validated.currency || currency;
          }
        } else {
          // Edge Function returned an error — use frontend total as fallback
          console.warn('⚠️ Market validation Edge Function returned error; using frontend total as fallback.');
        }
      }
    } catch (err) {
      // Network or timeout — use frontend total as fallback
      console.warn('⚠️ Market validation Edge Function unreachable; using frontend total as fallback.', err);
    }
    // ─────────────────────────────────────────────────────────────────────────

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'Pending',
      customer: {
        fullName: senderName.trim() || recipientName.trim() || session.user?.user_metadata?.full_name || session.user?.email?.split('@')[0] || 'Gift Customer',
        email: session.user?.email || 'mbmgifts.orders@gmail.com',
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim() || 'Addis Ababa',
        zipCode: '1000',
        giftRecipientName: recipientName.trim(),
        giftSenderName: senderName.trim(),
        giftMessage: giftMessage.trim(),
      },
      items: [...items],
      subtotal: subtotal,
      shipping: 0,
      total: serverValidatedTotal,  // Server-validated total
      paymentMethod: 'Chapa Payment Gateway',
      paymentStatus: 'PENDING_PAYMENT',
      giftBoxStyle: selectedBox?.name || 'Standard Box',
      giftBoxPrice: wrapTier,
      buyerMarket: serverValidatedMarket,  // Server-enforced market
      currency: serverValidatedCurrency,    // Server-enforced currency
      deliveryFee: 0,
    };
    // Note: customerName removed — we use session email's display name or recipientName

    setIsPlacingOrder(false);
    onOrderCreated(newOrder);
    // Note: Do NOT call onClearCart() here! The cart must remain intact if the user
    // navigates back from checkout. It will only be cleared upon verified payment in App.tsx.
  };

  const toggleContents = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFF8ED] font-inter selection:bg-[#D9A514] selection:text-[#2B0005]">
      {/* Header Bar */}
      <div className="border-b border-[#D9A514]/20 bg-[#2B0005]/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer text-sm uppercase tracking-wider font-bold">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </a>
          <img src="/logo.png" alt="MBM Gifts" referrerPolicy="no-referrer" className="h-10 sm:h-12 w-auto object-contain drop-shadow-md scale-[2]" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* ================= CART VIEW ================= */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="font-podium text-2xl sm:text-3xl text-white uppercase tracking-wider">Your Cart</h2>
            <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold w-fit">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Complimentary Express Delivery Included</span>
            </div>
          </div>

          {!session && items.length > 0 && (
            <a
              href="/login?redirect=/cart"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/login?redirect=/cart');
                }
              }}
              className="bg-amber-400/10 hover:bg-amber-400/15 transition-all border border-amber-400/30 rounded-xl p-4 mb-6 flex items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-400/20 group-hover:bg-amber-400/30 transition-colors rounded-full p-2 flex-shrink-0">
                  <Package className="w-5 h-5 text-amber-300" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-amber-300 text-sm font-bold">Sign up required to complete your order</p>
                  <p className="text-amber-300/70 text-xs">Click here to sign in or create an account — your filled details are saved</p>
                </div>
              </div>
              <span className="text-xs uppercase font-bold text-[#8c1119] bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors">
                Sign In / Up →
              </span>
            </a>
          )}

          {items.length === 0 ? (
            <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-12 text-center text-white/60">
              <Package className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-lg">Your gift cart is empty.</p>
              <p className="text-sm text-white/40 mt-2">Browse our collection and add items to get started</p>
              <a href="/" className="inline-block mt-4 text-amber-300 border-b border-amber-300/30 hover:border-amber-300 uppercase tracking-widest text-sm pb-1 font-bold">Return to Shop</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] gap-8 items-start">
              {/* Left Column: Items & Options */}
              <div>
                {/* Cart Items List */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-[#2a0407] border border-white/10 rounded-2xl p-4 flex gap-4">
                      <div className="w-20 h-20 bg-black/50 border border-white/10 rounded-xl overflow-hidden flex-shrink-0">
                        {item.type === 'package' && item.package.image ? (
                          <img
                            src={item.package.image}
                            alt={item.package.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : item.type === 'custom' && item.selectedItems[0]?.image ? (
                          <img
                            src={item.selectedItems[0].image}
                            alt="Custom box"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Box className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="font-podium text-lg uppercase text-white truncate">
                              {item.type === 'package' ? item.package.name : 'Custom Gift Box'}
                            </div>
                            <div className="text-xs text-white/50 mt-1">
                              {item.type === 'package' ? 'Ready-made package' : `Build your own — ${item.selectedItems.length} items`}
                            </div>
                          </div>
                          <div className="font-bold text-amber-300">
                            {formatPrice(calculateItemPrice(item), currency)}
                          </div>
                        </div>

                        {/* Custom Box Contents Toggle */}
                        {item.type === 'custom' && (
                          <div className="mt-2">
                            <button
                              onClick={() => toggleContents(item.id)}
                              className="text-[11px] text-[#8c1119] bg-amber-400/90 hover:bg-amber-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider cursor-pointer"
                            >
                              {expandedItems[item.id] ? "Hide inside ▴" : "What's inside ▾"}
                            </button>
                            {expandedItems[item.id] && (
                              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/70 space-y-1">
                                {item.selectedItems.map((si, idx) => {
                                  const singlePrice = buyerMarket === 'INTERNATIONAL'
                                    ? (si.price_usd != null && si.price_usd > 0 ? si.price_usd : Math.round((si.price / 120) * 100) / 100)
                                    : si.price;
                                  return (
                                    <div key={idx} className="flex justify-between">
                                      <span className="truncate pr-4">{si.name}</span>
                                      <span className="text-white/40">{formatPrice(singlePrice, currency)}</span>
                                    </div>
                                  );
                                })}
                                <div className="text-amber-300/70 pt-1 italic">{item.boxStyle.name}</div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-white/20 rounded-full bg-black/30">
                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-7 flex items-center justify-center text-white/60 hover:text-amber-300 cursor-pointer">–</button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-7 flex items-center justify-center text-white/60 hover:text-amber-300 cursor-pointer">+</button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gift Wrap / Box Styles — only shown for custom boxes when admin has added boxes in DB */}
                {hasCustomItems && giftBoxes.length > 0 && (
                <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-5 md:p-6 mt-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-podium text-xl uppercase tracking-wider text-white">How should we wrap it?</h3>
                    {selectedBox && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                        {selectedBox.name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/60 mb-5">
                    Choose your luxury physical container — price and dimensions apply directly to your total.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {giftBoxes.map((box) => {
                      const isSelected = (selectedBoxId || giftBoxes[0]?.id) === box.id;
                      return (
                        <div
                          key={box.id}
                          onClick={() => setSelectedBoxId(box.id)}
                          className={`group relative border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${isSelected
                              ? 'border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/50 shadow-lg shadow-amber-400/10'
                              : 'border-white/10 bg-black/30 hover:border-white/30 hover:bg-black/40'
                            }`}
                        >
                          {/* Box Image */}
                          <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-black/60">
                            <img
                              src={box.image}
                              alt={box.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            {/* Price tag */}
                            <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                              {getBoxPrice(box) === 0 ? 'Complimentary' : `+${formatPrice(getBoxPrice(box), currency)}`}
                            </div>

                            {/* Selection Radio / Badge */}
                            <div className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'bg-amber-400 border-amber-400 text-[#8c1119]' : 'bg-black/50 border-white/40 text-transparent'
                              }`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>

                          {/* Details Body */}
                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className={`font-podium text-sm uppercase font-bold transition-colors ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                                {box.name}
                              </h4>
                              <div className="text-[10px] text-amber-300/80 font-mono font-semibold mt-0.5 mb-1.5">
                                {box.dimensions} {box.color ? `• ${box.color}` : ''}
                              </div>
                              <p className="text-white/70 text-xs font-inter leading-relaxed line-clamp-2">
                                {box.description}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                              <span className={isSelected ? 'text-amber-300 font-bold uppercase tracking-wider' : 'text-white/40 uppercase tracking-wider'}>
                                {isSelected ? '✓ Selected Style' : 'Click to Select'}
                              </span>
                              <span className="text-white/80 font-bold">
                                {getBoxPrice(box) === 0 ? 'Included Free' : `+${formatPrice(getBoxPrice(box), currency)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}

                {/* Gift Note with Live Preview */}
                <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-5 md:p-6 mt-6 space-y-6">
                  <div>
                    <h3 className="font-podium text-xl uppercase mb-1">Add a personalized gift note</h3>
                    <div className="text-xs text-white/60 mb-4">Optional — we'll hand-print it on premium cardstock and tuck it securely inside your box.</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1.5">To (Recipient Name)</label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="e.g. Bethlehem Abera"
                          className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1.5">From (Your Name / Sender)</label>
                        <input
                          type="text"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="e.g. Yonas & Family"
                          className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1.5">Gift Message</label>
                      <textarea
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        maxLength={200}
                        placeholder="Write your heartfelt message here..."
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400 resize-y min-h-[80px]"
                      />
                      <div className="text-right text-[10px] text-white/40 mt-1">
                        {giftMessage.length} / 200 characters
                      </div>
                    </div>
                  </div>

                  {/* LIVE PREVIEW COMPONENT */}
                  <div className="pt-2 border-t border-white/10">
                    <GiftNotePreview
                      recipientName={recipientName}
                      senderName={senderName}
                      giftMessage={giftMessage}
                    />
                  </div>
                </div>

                {/* Delivery Mode & Location Details */}
                <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-5 md:p-6 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-podium text-xl uppercase text-white">Delivery Details</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full w-fit">
                      ★ Free Express Delivery
                    </span>
                  </div>
                  <div className="text-xs text-white/60 mb-4">Please provide delivery location and contact number</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    <div
                      onClick={() => setShipMode('recipient')}
                      className={`border rounded-xl p-4 flex gap-3 cursor-pointer items-start transition-colors ${shipMode === 'recipient' ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-black/20'
                        }`}
                    >
                      <Truck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${shipMode === 'recipient' ? 'text-amber-300' : 'text-white/40'}`} />
                      <div>
                        <div className={`text-sm font-bold ${shipMode === 'recipient' ? 'text-amber-300' : 'text-white'}`}>Ship to recipient</div>
                        <div className="text-[11px] text-white/50 mt-1">Sent directly, prices hidden on packing slip.</div>
                      </div>
                    </div>
                    <div
                      onClick={() => setShipMode('me')}
                      className={`border rounded-xl p-4 flex gap-3 cursor-pointer items-start transition-colors ${shipMode === 'me' ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-black/20'
                        }`}
                    >
                      <Package className={`w-5 h-5 flex-shrink-0 mt-0.5 ${shipMode === 'me' ? 'text-amber-300' : 'text-white/40'}`} />
                      <div>
                        <div className={`text-sm font-bold ${shipMode === 'me' ? 'text-amber-300' : 'text-white'}`}>Ship to me</div>
                        <div className="text-[11px] text-white/50 mt-1">I'll deliver it myself.</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Address Form — no Customer Full Name field */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    {validationError && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-xs font-semibold flex items-center gap-2">
                        <span>⚠️ {validationError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-1.5 flex items-center justify-between">
                        <span>Phone Number <span className="text-red-400">*</span></span>
                        <span className="text-amber-400/80 text-[9px] font-normal">For delivery confirmation</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +251 911 234 567"
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-1.5 flex items-center justify-between">
                          <span>Delivery Address / Location <span className="text-red-400">*</span></span>
                          <span className="text-amber-400/80 text-[9px] font-normal">Street, landmark, or house #</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Bole Sub-city, Woreda 03, House #142"
                          className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-1.5">
                          City / Area
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Addis Ababa"
                          className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Summary Sticky Box */}
              <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-6 sticky top-24 shadow-2xl">
                <h3 className="font-podium text-2xl uppercase mb-5">Order summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span className="font-bold">{formatPrice(subtotal, currency)}</span>
                  </div>
                  {hasCustomItems && selectedBox && (
                    <div className="flex justify-between text-white/80">
                      <span className="truncate pr-2">Packaging: {selectedBox.name}</span>
                      <span className="font-bold flex-shrink-0">
                        {wrapTier === 0 ? 'Free' : formatPrice(wrapTier, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/80">Delivery in Ethiopia</span>
                    <span className="text-emerald-400 font-extrabold uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                      FREE
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 my-4"></div>

                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-sm uppercase tracking-widest font-bold text-white/70 block">Total</span>
                    <span className="text-[10px] text-amber-300/80 uppercase font-semibold">
                      {buyerMarket === 'INTERNATIONAL' ? 'USD (International)' : 'ETB (Ethiopia)'}
                    </span>
                  </div>
                  <span className="font-podium text-3xl text-amber-300">{formatPrice(total, currency)}</span>
                </div>

                <button
                  id="cart-place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-70 disabled:cursor-not-allowed text-[#8c1119] font-bold py-4 text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <span>Validating order...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{session ? 'Proceed to Chapa Payment' : 'Sign up to place order'}</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-white/40 mt-4 uppercase tracking-widest">
                  {session ? "Secure Checkout Powered by Chapa" : 'Create an account to complete your purchase'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
