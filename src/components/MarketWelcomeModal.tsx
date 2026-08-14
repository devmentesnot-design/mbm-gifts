import React, { useEffect, useState } from 'react';
import { Gift, MapPin, ShieldCheck } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

/**
 * MarketWelcomeModal
 *
 * Shown only on a customer's first visit (before they confirm their market).
 * Non-dismissable — the customer MUST click "Continue Shopping" to proceed.
 * Elegant, MBM-branded, no choice presented — just a friendly confirmation.
 */
export const MarketWelcomeModal: React.FC = () => {
  const { buyerMarket, buyerCountry, buyerCountryName, currency, isDetecting, showWelcomeModal, confirmMarket } =
    useMarket();

  // Staggered animation mount
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (showWelcomeModal && !isDetecting) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [showWelcomeModal, isDetecting]);

  if (!showWelcomeModal || isDetecting) return null;

  const isEthiopia = buyerMarket === 'ETHIOPIA';
  const countryDisplay = isEthiopia ? 'Ethiopia' : (buyerCountryName || buyerCountry || 'your country');
  const flag = isEthiopia ? '🇪🇹' : getFlagEmoji(buyerCountry || '');

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to MBM Gifts"
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 transition-all duration-500 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ transformOrigin: 'center center' }}
      >
        <div className="relative w-full max-w-md bg-gradient-to-b from-[#3d0a0e] to-[#280608] border border-amber-400/30 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Top Accent Bar */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600" />

          {/* Content */}
          <div className="px-7 pt-8 pb-8 flex flex-col items-center text-center gap-5">
            {/* Brand Logo */}
            <div className="flex items-center justify-center mb-1">
              <img
                src="/logo.png"
                alt="MBM Gifts"
                className="h-12 w-auto object-contain drop-shadow-lg"
                style={{ filter: 'brightness(1.1)' }}
              />
            </div>

            {/* Flag + Country */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`
                  flex items-center justify-center w-20 h-20 rounded-full text-5xl
                  shadow-[0_0_30px_rgba(245,180,0,0.15)]
                  ${isEthiopia
                    ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/10 border-2 border-amber-400/40'
                    : 'bg-gradient-to-br from-blue-400/20 to-indigo-600/10 border-2 border-blue-400/40'
                  }
                `}
              >
                {flag}
              </div>

              <div className="space-y-1">
                <h2 className="font-podium text-2xl sm:text-3xl uppercase tracking-wider text-white font-bold">
                  Welcome to MBM Gifts
                </h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  We detected that you are shopping from{' '}
                  <strong className="text-amber-300 font-semibold">{countryDisplay}</strong>.
                </p>
              </div>
            </div>

            {/* Currency Info Card */}
            <div
              className={`
                w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border
                ${isEthiopia
                  ? 'bg-amber-400/10 border-amber-400/30'
                  : 'bg-blue-400/10 border-blue-400/30'
                }
              `}
            >
              <div
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isEthiopia ? 'bg-amber-400/20' : 'bg-blue-400/20'}
                `}
              >
                <MapPin className={`w-4.5 h-4.5 ${isEthiopia ? 'text-amber-300' : 'text-blue-300'}`} />
              </div>
              <div className="text-left">
                <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold leading-none mb-0.5">
                  {isEthiopia ? 'Ethiopia Market' : 'International Market'}
                </p>
                <p className="text-sm text-white font-semibold leading-snug">
                  Prices &amp; checkout in{' '}
                  <span className={`font-bold ${isEthiopia ? 'text-amber-300' : 'text-blue-300'}`}>
                    {currency === 'ETB' ? 'ETB (Ethiopian Birr)' : 'USD (US Dollar)'}
                  </span>
                </p>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-1.5 text-[11px] text-white/35">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
              <span>Market is securely assigned based on your location</span>
            </div>

            {/* CTA Button */}
            <button
              id="market-welcome-continue-btn"
              onClick={confirmMarket}
              className={`
                w-full font-podium text-base uppercase tracking-widest py-4 px-6 rounded-2xl
                font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                shadow-xl flex items-center justify-center gap-2.5 cursor-pointer
                ${isEthiopia
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-[#8c1119] shadow-amber-400/25'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-blue-500/25'
                }
              `}
            >
              <Gift className="w-4.5 h-4.5" />
              Continue Shopping
            </button>

            <p className="text-[10px] text-white/25 leading-relaxed px-2">
              You can request a region change from the website footer if needed.
            </p>
          </div>

          {/* Bottom Accent Bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        </div>
      </div>
    </>
  );
};

// Converts ISO country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌍';
  }
}
