import React, { useState } from 'react';
import { ArrowLeft, Package, Truck, Check, Clock, ChevronDown, ChevronUp, Search, Filter, ShoppingBag, Headset, ShieldCheck, CreditCard, FileText } from 'lucide-react';
import { Order, OrderStatus } from '../types/cart';
import { formatPrice } from '../utils/currency';
import { OfficialReceiptModal } from './OfficialReceiptModal';

interface MyOrdersPageProps {
  orders: Order[];
  session: any;
  onNavigate: (path: string) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ orders, session, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter(ord => {
    const matchesSearch = ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.chapaTxRef && ord.chapaTxRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ord.customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || ord.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      default:
        return null;
    }
  };

  const getOrderCurrency = (ord: Order): 'ETB' | 'USD' => {
    if (ord.currency === 'USD' || ord.buyerMarket === 'INTERNATIONAL') return 'USD';
    return 'ETB';
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFF8ED] font-inter selection:bg-[#D9A514] selection:text-[#2B0005]">
      {/* Top Header Navigation */}
      <div className="border-b border-[#D9A514]/20 bg-[#2B0005]/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm uppercase tracking-wider font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            <span>Back to Shop</span>
          </button>
          
          <img src="/logo.png" alt="MBM Gifts" referrerPolicy="no-referrer" className="h-24 sm:h-28 w-auto object-contain drop-shadow-md" />

          {session && (
            <div className="flex items-center gap-2.5 bg-black/40 border border-amber-400/40 rounded-full pl-1.5 pr-3 py-1">
              {(() => {
                const avatarUrl = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture || null;
                const fullName = session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || '';
                const firstName = fullName.trim() ? fullName.trim().split(' ')[0] : (session.user?.email?.split('@')[0] || 'User').charAt(0).toUpperCase() + (session.user?.email?.split('@')[0] || 'user').slice(1);
                
                return avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={firstName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-amber-400/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-[#8c1119] font-extrabold flex items-center justify-center text-xs shadow-inner">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                );
              })()}
              <span className="font-semibold tracking-wide text-amber-200 text-xs max-w-[100px] truncate">
                {(() => {
                  const fullName = session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || '';
                  if (fullName.trim()) {
                    return fullName.trim().split(' ')[0];
                  }
                  const email = session.user?.email || '';
                  const username = email.split('@')[0] || 'User';
                  return username.charAt(0).toUpperCase() + username.slice(1);
                })()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        
        {/* Page Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">
              <Package className="w-4 h-4" />
              <span>Customer Portal</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ml-2">
                <Headset className="w-3 h-3 text-emerald-400" />
                24/7 Dispatch Active
              </span>
            </div>
            <h1 className="font-podium text-3xl sm:text-4xl text-white uppercase tracking-wider">
              My Orders
            </h1>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              Track delivery progress, review package items, and verify Chapa payment receipts.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="self-start md:self-auto bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order New Gift</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        {orders.length > 0 && (
          <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search order ID, name, or ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] text-white/40 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
              </span>
              {['all', 'pending', 'delivered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-amber-400 text-[#8c1119] shadow-sm'
                      : 'bg-black/30 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Orders Listing */}
        {orders.length === 0 ? (
          <div className="bg-[#2a0407] border border-white/10 rounded-3xl p-12 sm:p-16 text-center text-white/60 max-w-xl mx-auto my-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Truck className="w-10 h-10" />
            </div>
            <h2 className="font-podium text-2xl uppercase text-white mb-2 tracking-wider">No Orders Placed Yet</h2>
            <p className="text-sm text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
              When you send gifts or create custom gift boxes with MBM Gifts, your live order status and tracking details will appear right here.
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer shadow-xl shadow-amber-400/20 inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Gift Collection</span>
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-10 text-center text-white/50">
            <p className="text-sm">No orders matching your search or filter criteria.</p>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="mt-3 text-xs text-amber-300 underline uppercase tracking-wider font-bold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((ord, idx) => {
              const isExpanded = expandedOrders[ord.id] ?? (idx === 0);
              const ordCurr = getOrderCurrency(ord);
              const isPaid = ord.paymentStatus === 'PAID' || ord.status === 'Processing' || ord.status === 'Delivered';

              return (
                <div 
                  key={ord.id}
                  className="bg-[#2a0407] border border-white/10 hover:border-amber-400/30 transition-all rounded-2xl overflow-hidden shadow-xl"
                >
                  {/* Order Top Summary Header */}
                  <div className="p-4 md:p-5 bg-[#350509] border-b border-white/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="font-podium text-2xl text-white uppercase tracking-wider font-bold">
                          {ord.id}
                        </div>

                        {/* Market Badge */}
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 border border-white/20 text-white flex items-center gap-1">
                          <span>{ord.buyerMarket === 'INTERNATIONAL' ? '🌍 Diaspora (USD)' : '🇪🇹 Local (ETB)'}</span>
                        </span>

                        {/* Payment Status Badge */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          <span>{isPaid ? 'PAID' : 'PENDING PAYMENT'}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 text-xs text-white/70">
                        <div>
                          <span className="text-white/40 uppercase tracking-wider text-[10px] block">Placed On</span>
                          <span className="font-semibold text-white">{ord.createdAt}</span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase tracking-wider text-[10px] block">Total Amount</span>
                          <span className="font-podium text-xl text-amber-300 font-bold">
                            {formatPrice(ord.total, ordCurr)}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleExpand(ord.id)}
                          className="p-1.5 bg-black/30 hover:bg-black/50 rounded-lg border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                          title="Toggle Order Details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Status Badge & Chapa Reference */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="inline-flex">
                        {getStatusBadge(ord.status)}
                      </div>

                      {ord.chapaTxRef && (
                        <div className="flex items-center gap-1.5 text-[11px] bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg">
                          <span className="text-white/50">Chapa Ref:</span>
                          <span className="font-mono text-amber-300 font-bold">{ord.chapaTxRef}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Order Body */}
                  {isExpanded && (
                    <div className="p-5 md:p-6 space-y-6">
                      
                      {/* Customer & Recipient Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 border border-white/10 rounded-xl p-4 text-xs">
                        <div>
                          <span className="text-amber-300 uppercase font-bold text-[10px] tracking-wider block mb-1">Customer / Recipient</span>
                          <div className="text-white font-semibold">{ord.customer.fullName}</div>
                          <div className="text-white/60">{ord.customer.phone}</div>
                          <div className="text-white/40 text-[11px]">{ord.customer.email}</div>
                          {ord.customer.giftRecipientName && (
                            <div className="text-amber-200/80 mt-1 italic">
                              Gift for: {ord.customer.giftRecipientName}
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-amber-300 uppercase font-bold text-[10px] tracking-wider block mb-1">Delivery Destination (Ethiopia)</span>
                          <div className="text-white font-semibold">{ord.customer.address}</div>
                          <div className="text-white/60">{ord.customer.city}</div>
                          {ord.customer.giftMessage && (
                            <div className="text-amber-200/90 mt-2 text-[11px] bg-amber-400/10 border border-amber-400/20 rounded-lg p-2.5">
                              "{ord.customer.giftMessage}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items in this Order */}
                      <div>
                        <span className="text-white/50 uppercase font-bold text-[10px] tracking-widest block mb-3">Items Included ({ord.items.length})</span>
                        <div className="space-y-3">
                          {ord.items.map((item) => {
                            const isPkg = item.type === 'package';
                            const title = isPkg ? item.package.name : 'Custom Gift Box';
                            const img = isPkg ? item.package.image : item.boxStyle.image;
                            
                            // Determine item unit price in the order's specific currency
                            let unitPrice = 0;
                            if (ordCurr === 'USD') {
                              if (isPkg) {
                                unitPrice = item.package.price_usd != null && item.package.price_usd > 0
                                  ? item.package.price_usd
                                  : Math.round((item.package.price / 120) * 100) / 100;
                              } else {
                                unitPrice = item.selectedItems?.reduce((s, si) => {
                                  const p = si.price_usd != null && si.price_usd > 0 ? si.price_usd : Math.round((si.price / 120) * 100) / 100;
                                  return s + p;
                                }, 0) || item.totalPrice;
                              }
                            } else {
                              unitPrice = isPkg ? item.package.price : item.totalPrice;
                            }

                            return (
                              <div key={item.id} className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                                <img src={img} alt={title} className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-white/10 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-podium text-sm uppercase text-white truncate font-bold">{title}</div>
                                  <div className="text-[11px] text-white/50 truncate">
                                    {isPkg ? `${item.package.category} • Package` : `Custom Box • ${item.selectedItems.length} items`}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs text-white/50">Qty: {item.quantity}</div>
                                  <div className="text-xs font-bold text-amber-300">
                                    {formatPrice(unitPrice * item.quantity, ordCurr)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Summary Breakdown */}
                      <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-amber-300" />
                            <span className="text-white/70">Payment:</span>
                            <span className="font-semibold text-white">{ord.paymentMethod || 'Chapa Payment'}</span>
                          </div>
                          
                          <button
                            onClick={() => setSelectedReceiptOrder(ord)}
                            className="bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View / Print Official Receipt</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-white/60">Final Total:</span>
                          <span className="font-podium text-xl font-bold text-amber-300">
                            {formatPrice(ord.total, ordCurr)}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Official Receipt Modal View */}
      {selectedReceiptOrder && (
        <OfficialReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

    </div>
  );
};
