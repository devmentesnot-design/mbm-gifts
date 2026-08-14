import React from 'react';
import { ShieldCheck, Printer, ArrowLeft, PackageCheck, ShoppingBag, MapPin, Phone, Mail, CheckCircle2, Calendar } from 'lucide-react';
import { Order } from '../types/cart';
import { formatPrice } from '../utils/currency';

interface OfficialReceiptModalProps {
  order: Order;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
  isStandalonePage?: boolean;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  order,
  onClose,
  onNavigate,
  isStandalonePage = false,
}) => {
  const market = order.buyerMarket || 'ETHIOPIA';
  const currency = order.currency || (market === 'ETHIOPIA' ? 'ETB' : 'USD');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`receipt-container font-inter ${isStandalonePage ? 'min-h-screen bg-[#1f0305] text-white p-3 sm:p-6 flex flex-col items-center justify-center' : 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto'}`}>
      
      <div className="w-full max-w-3xl flex flex-col my-auto">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="no-print w-full flex items-center justify-between gap-3 mb-3">
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white/80 hover:text-white text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" />
              <span>Back to Orders</span>
            </button>
          ) : onNavigate ? (
            <button
              onClick={() => onNavigate('/my-orders')}
              className="flex items-center gap-2 text-white/80 hover:text-white text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" />
              <span>Go to My Orders</span>
            </button>
          ) : <div />}

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        {/* The Printable Official Receipt Document Card */}
        <div className="printable-receipt w-full bg-white text-slate-900 rounded-2xl shadow-2xl p-5 sm:p-8 border border-slate-200">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3.5">
              {/* Logo with high-contrast luxury crimson container so white/gold logo is crystal clear */}
              <div className="bg-[#3b060a] p-2 rounded-xl border border-[#8c1119]/30 shadow-md flex items-center justify-center flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="MBM Gifts Logo" 
                  className="h-11 sm:h-13 w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="font-podium text-xl sm:text-2xl font-bold tracking-wide text-[#8c1119] uppercase leading-tight">MBM Luxury Gifts</h1>
                <p className="text-[11px] text-slate-500 font-medium">Premium Gift Boxes & Curated Hampers</p>
                <p className="text-[10px] text-slate-400">Addis Ababa, Ethiopia • support@mbmgifts.com</p>
              </div>
            </div>

            <div className="text-left sm:text-right flex-shrink-0">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Payment Verified & Paid</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Official Receipt / Invoice</div>
              <div className="font-podium text-xl font-bold text-slate-900 tracking-wide">{order.id}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center sm:justify-end gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{order.createdAt || new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment & Security Metadata Bar */}
          <div className="my-3.5 bg-slate-50 rounded-xl p-3 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase text-[9px] font-bold block">Chapa Reference</span>
              <span className="font-mono text-slate-800 font-bold text-[11px] break-all">{order.chapaTxRef || 'CHAPA-VERIFIED'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] font-bold block">Payment Method</span>
              <span className="text-slate-800 font-semibold text-[11px]">{order.paymentMethod || 'Chapa Payment Gateway'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] font-bold block">Market & Currency</span>
              <span className="text-slate-800 font-semibold text-[11px]">
                {market === 'INTERNATIONAL' ? '🌍 Diaspora (USD)' : '🇪🇹 Ethiopian Local (ETB)'}
              </span>
            </div>
          </div>

          {/* Customer & Recipient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
            <div className="space-y-0.5">
              <span className="text-[#8c1119] uppercase font-bold text-[9px] tracking-wider block">Customer / Sender</span>
              <div className="text-slate-900 font-bold">{order.customer.fullName}</div>
              {order.customer.email && (
                <div className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{order.customer.email}</span>
                </div>
              )}
              <div className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{order.customer.phone}</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[#8c1119] uppercase font-bold text-[9px] tracking-wider block">Delivery Recipient (Ethiopia)</span>
              <div className="text-slate-900 font-bold">
                {order.customer.giftRecipientName ? `${order.customer.giftRecipientName} (c/o ${order.customer.fullName})` : order.customer.fullName}
              </div>
              <div className="text-slate-600 flex items-start gap-1 text-[11px]">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{order.customer.address}, {order.customer.city}</span>
              </div>
              {order.customer.giftMessage && (
                <div className="mt-1 text-[10px] text-slate-700 bg-amber-50 border border-amber-200 rounded p-1.5 italic">
                  <strong>Gift Note:</strong> "{order.customer.giftMessage}"
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="my-3">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[9px] tracking-wider">
                  <th className="py-1.5 px-2">Item Description</th>
                  <th className="py-1.5 px-2 text-center">Type</th>
                  <th className="py-1.5 px-2 text-center">Qty</th>
                  <th className="py-1.5 px-2 text-right">Price ({currency})</th>
                  <th className="py-1.5 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((it, idx) => {
                  const isPkg = it.type === 'package';
                  const title = isPkg ? it.package.name : 'Custom Gift Box';
                  
                  let unitPrice = 0;
                  if (currency === 'USD') {
                    if (isPkg) {
                      unitPrice = it.package.price_usd != null && it.package.price_usd > 0
                        ? it.package.price_usd
                        : Math.round((it.package.price / 120) * 100) / 100;
                    } else {
                      unitPrice = it.selectedItems?.reduce((s, si) => {
                        const p = si.price_usd != null && si.price_usd > 0 ? si.price_usd : Math.round((si.price / 120) * 100) / 100;
                        return s + p;
                      }, 0) || it.totalPrice;
                    }
                  } else {
                    unitPrice = isPkg ? it.package.price : it.totalPrice;
                  }

                  return (
                    <tr key={idx} className="py-1.5">
                      <td className="py-2 px-2">
                        <div className="font-bold text-slate-800 text-xs">{title}</div>
                        <div className="text-[9px] text-slate-400">
                          {isPkg ? `${it.package.category}` : `${it.selectedItems?.length || 0} customized items`}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center text-slate-500 text-[11px]">{isPkg ? 'Package' : 'Custom Box'}</td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-700 text-xs">{it.quantity}</td>
                      <td className="py-2 px-2 text-right text-slate-600 text-xs">{formatPrice(unitPrice, currency)}</td>
                      <td className="py-2 px-2 text-right font-bold text-slate-900 text-xs">{formatPrice(unitPrice * it.quantity, currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculation & Summary Footer */}
          <div className="pt-3 border-t-2 border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
              Packaged in luxury MBM gift box with custom satin ribbon wrapping & hand delivery across Ethiopia.
            </div>

            <div className="w-full sm:w-56 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatPrice(order.total, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Delivery (Ethiopia):</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200 font-bold text-slate-900">
                <span className="uppercase font-podium text-sm text-[#8c1119]">Total Paid:</span>
                <span className="font-podium text-lg text-[#8c1119]">{formatPrice(order.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Security & Official Stamp */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verification Code: {order.chapaTxRef ? order.chapaTxRef.slice(-12) : 'AUTH-VALID'}</span>
            </div>
            <div>MBM Gifts Studio • Addis Ababa</div>
          </div>

        </div>

        {/* Bottom Floating Navigation (Hidden in Print) */}
        <div className="no-print w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-3">
          <button
            onClick={() => onNavigate ? onNavigate('/') : window.location.href = '/'}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>Send Another Gift</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('/my-orders') : window.location.href = '/my-orders'}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20 transition-all"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>View All Orders</span>
          </button>
        </div>
      </div>

    </div>
  );
};
