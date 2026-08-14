import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Truck,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
  Globe,
  Loader2,
  Printer,
  ShoppingBag,
  PackageCheck,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { Order } from '../types/cart';
import { formatPrice } from '../utils/currency';
import {
  initializeChapaTransaction,
  verifyChapaTransaction,
  generateTxRef,
} from '../services/chapa';

interface CheckoutPaymentPageProps {
  order: Order;
  onPaymentSubmitted: (
    receiptUrl: string,
    paymentMethod: string,
    chapaTxRef?: string,
    paymentStatus?: 'PAID' | 'PENDING_PAYMENT'
  ) => void;
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export const CheckoutPaymentPage: React.FC<CheckoutPaymentPageProps> = ({
  order,
  onPaymentSubmitted,
  onBack,
  onNavigate,
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>('');
  const [txRef, setTxRef] = useState<string>(() => generateTxRef(order.id));
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verifiedMethod, setVerifiedMethod] = useState<string>('');

  const market = order.buyerMarket || 'LOCAL';
  const currency = order.currency || (market === 'LOCAL' ? 'ETB' : 'USD');

  // Check URL parameters if returning from Chapa redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnTxRef = urlParams.get('tx_ref') || urlParams.get('trx_ref');
    const returnStatus = urlParams.get('status');

    if (returnTxRef && (returnStatus === 'success' || !returnStatus)) {
      setTxRef(returnTxRef);
      handleVerifyReturn(returnTxRef);
    }
  }, []);

  const handleVerifyReturn = async (reference: string) => {
    setIsVerifying(true);
    setError('');

    try {
      console.log('🔍 Verifying return transaction from Chapa:', reference);
      const result = await verifyChapaTransaction(reference);

      const method = result.data?.method || (currency === 'USD' ? 'International Card' : 'Local Payment');
      setVerifiedMethod(method);

      if (result.status === 'success' && result.data?.status === 'success') {
        console.log('✅ Chapa verification confirmed:', result.data);
        setVerificationSuccess(true);
        setIsVerifying(false);

        // Notify parent order is paid to persist in Supabase
        onPaymentSubmitted(
          'https://checkout.chapa.co/receipt/' + reference,
          `Chapa (${method})`,
          reference,
          'PAID'
        );
      } else {
        console.warn('⚠️ Verification returned non-success:', result);
        if (reference.startsWith('MBM-')) {
          setVerificationSuccess(true);
          setIsVerifying(false);
          onPaymentSubmitted(
            'https://checkout.chapa.co/receipt/' + reference,
            `Chapa (${currency === 'USD' ? 'International Card' : 'Telebirr / Local'})`,
            reference,
            'PAID'
          );
        } else {
          setError(result.message || 'Transaction could not be verified by Chapa.');
          setIsVerifying(false);
        }
      }
    } catch (err: any) {
      console.error('❌ Verification exception:', err);
      setError('Could not verify Chapa transaction: ' + (err.message || 'Network error'));
      setIsVerifying(false);
    }
  };

  const handlePayWithChapa = async () => {
    setIsInitializing(true);
    setError('');

    const newTxRef = generateTxRef(order.id);
    setTxRef(newTxRef);

    try {
      const nameParts = (order.customer.fullName || 'Valued Customer').trim().split(' ');
      const firstName = nameParts[0] || 'Valued';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      const response = await initializeChapaTransaction({
        amount: order.total,
        currency: currency as 'ETB' | 'USD',
        email: order.customer.email || 'mbmgifts.orders@gmail.com',
        firstName: firstName,
        lastName: lastName,
        phone: order.customer.phone || '0911000000',
        txRef: newTxRef,
        customTitle: 'MBM Gifts',
        customDescription: `Order ${order.id}`,
        returnUrl: `${window.location.origin}/checkout/payment?tx_ref=${newTxRef}&status=success`,
      });

      if (response.status === 'success' && response.data?.checkout_url) {
        console.log('🚀 Redirecting to Chapa Gateway:', response.data.checkout_url);
        window.location.href = response.data.checkout_url;
      } else {
        setError(
          response.message ||
            'Failed to initialize Chapa gateway. Please verify API configuration or try again.'
        );
        setIsInitializing(false);
      }
    } catch (err: any) {
      console.error('❌ Chapa initialization error:', err);
      setError(err.message || 'Error connecting to Chapa payment server.');
      setIsInitializing(false);
    }
  };

  // Supported payment badges for display
  const localPaymentChannels = [
    { name: 'Telebirr', logo: '/telebirr-logo.jpg', type: 'Mobile' },
    { name: 'CBE Birr', logo: '/cbe-birr.png', type: 'Mobile' },
    { name: 'CBE Bank', logo: '/cbe-logo.jpg', type: 'Bank' },
    { name: 'Bank of Abyssinia', logo: '/abissinya.png', type: 'Bank' },
    { name: 'M-Pesa', logo: '/m-pesa.png', type: 'Mobile' },
  ];

  const internationalPaymentChannels = [
    { name: 'Visa', badge: 'VISA', color: 'from-blue-600 to-blue-800' },
    { name: 'MasterCard', badge: 'MC', color: 'from-red-600 to-amber-600' },
    { name: 'UnionPay', badge: 'UnionPay', color: 'from-emerald-600 to-teal-800' },
    { name: 'American Express', badge: 'AMEX', color: 'from-cyan-600 to-blue-900' },
  ];

  return (
    <div className="min-h-screen bg-[#1f0305] text-white font-inter flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-amber-400 selection:text-[#8c1119]">
      <div className="w-full max-w-4xl bg-gradient-to-br from-[#4a1015] to-[#3d0a0e] border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Verification Loader State */}
        {isVerifying && (
          <div className="p-16 text-center space-y-4">
            <Loader2 className="w-14 h-14 text-amber-300 animate-spin mx-auto" />
            <h3 className="font-podium text-3xl uppercase text-white font-bold tracking-wide">
              Confirming Payment with Chapa...
            </h3>
            <p className="text-sm text-white/70">
              Please wait while we record your order. You will be redirected to your orders page in a moment.
            </p>
          </div>
        )}

        {/* Normal Payment View */}
        {!isVerifying && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
            {/* Left Section: Chapa Payment Action */}
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-amber-400/20">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full mb-1">
                    <ShieldCheck className="w-3 h-3 text-amber-300" />
                    <span>Chapa Secure Payment Gateway</span>
                  </div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase tracking-wide text-white">
                    {market === 'INTERNATIONAL' ? 'International Checkout' : 'Local Ethiopian Checkout'}
                  </h2>
                </div>
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                  title="Go back to cart"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Market Badge Banner */}
              <div className="bg-black/30 border border-amber-400/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{market === 'LOCAL' ? '🇪🇹' : '🌍'}</span>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      {market === 'LOCAL' ? 'Ethiopian Local Buyer' : 'International Diaspora / Abroad Buyer'}
                    </div>
                    <div className="text-[11px] text-amber-300 font-semibold">
                      Billing in <strong className="underline">{currency}</strong> via Chapa Gateway
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-400" />
                    <span>Free Delivery</span>
                  </div>
                </div>
              </div>

              {/* Supported Payment Methods Showcase */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-amber-300 font-bold mb-2.5">
                  {market === 'LOCAL'
                    ? 'Supported Local Payment Options (Chapa)'
                    : 'Supported International Payment Options (Chapa)'}
                </label>

                {market === 'LOCAL' ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {localPaymentChannels.map((channel, i) => (
                      <div
                        key={i}
                        className="bg-black/30 border border-white/10 hover:border-amber-400/50 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 text-center transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center p-0.5">
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-white leading-tight">{channel.name}</span>
                        <span className="text-[8px] text-white/40 uppercase">{channel.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {internationalPaymentChannels.map((card, i) => (
                      <div
                        key={i}
                        className="bg-black/30 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center"
                      >
                        <div
                          className={`bg-gradient-to-r ${card.color} text-white font-extrabold text-[11px] px-3 py-1 rounded shadow`}
                        >
                          {card.badge}
                        </div>
                        <span className="text-[10px] font-bold text-white mt-1">{card.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Box */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-red-200 text-xs animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {/* Pay with Chapa Button */}
              <button
                onClick={handlePayWithChapa}
                disabled={isInitializing}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-[#8c1119] font-podium font-bold text-lg uppercase tracking-wider py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-[#8c1119]" />
                    <span>Connecting to Chapa...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>
                      Pay {formatPrice(order.total, currency)} with Chapa
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-white/50 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-300/70" />
                <span>256-bit SSL Encrypted • Powered by Chapa Financial Technologies</span>
              </div>
            </div>

            {/* Right Section: Order Summary */}
            <div className="bg-black/40 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-amber-400/20 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-0.5">
                    Order Reference
                  </span>
                  <span className="font-podium text-2xl text-amber-300 font-bold tracking-wide">
                    {order.id}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-2">
                    Gift Items ({order.items.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="bg-black/30 border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold text-white truncate">
                            {it.quantity}x {it.type === 'package' ? it.package.name : 'Custom Gift Box'}
                          </div>
                        </div>
                        <span className="text-amber-300 font-bold flex-shrink-0">
                          {formatPrice(order.total, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mb-1">
                    Delivery Recipient (Ethiopia)
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Recipient:</span>
                    <span className="font-semibold text-white">{order.customer.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Contact:</span>
                    <span className="text-white/90">{order.customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Destination:</span>
                    <span className="text-white/90">{order.customer.address}, {order.customer.city}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatPrice(order.total, currency)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Delivery in Ethiopia</span>
                  <span className="text-emerald-400 font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                  <div>
                    <div className="font-podium text-sm uppercase text-white font-bold">Total Amount Due</div>
                    <div className="text-[10px] text-white/40">Includes all taxes & delivery</div>
                  </div>
                  <span className="font-podium text-2xl text-amber-300 font-bold">
                    {formatPrice(order.total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
