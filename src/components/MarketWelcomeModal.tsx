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
        className={`fixed inset-0 z-[9998] bg-[#241A15]/70 backdrop-blur-md transition-opacity duration-500 ${
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
        <div className="relative w-full max-w-md bg-[#FBF8F2] border border-[#D8C6A8] rounded-3xl shadow-[0_20px_60px_rgba(58,42,32,0.25)] overflow-hidden font-inter text-[#241A15]">
          {/* Top Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#D8C6A8] via-[#E6D5B8] to-[#B8944A]" />

          {/* Content */}
          <div className="px-7 pt-8 pb-8 flex flex-col items-center text-center gap-5">
            {/* Circular Logo Badge */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`
                  flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full p-4
                  shadow-md transition-all duration-300
                  ${isEthiopia
                    ? 'bg-gradient-to-br from-[#FAF6EE] to-[#E6D5B8] border-2 border-[#B8944A]/60 ring-4 ring-[#E6D5B8]/40'
                    : 'bg-gradient-to-br from-[#FAF6EE] to-[#E6D5B8] border-2 border-[#B8944A]/60 ring-4 ring-[#E6D5B8]/40'
                  }
                `}
              >
                <img
                  src="/golden_logo.png"
                  alt="MBM Gifts"
                  className="w-full h-full object-contain drop-shadow-md scale-[1.8]"
                />
              </div>

              <div className="space-y-1 mt-1">
                <h2 className="font-podium text-2xl sm:text-3xl uppercase tracking-wider text-[#241A15] font-bold">
                  Welcome to MBM Gifts
                </h2>
                <p className="text-[#756457] text-sm leading-relaxed">
                  We detected that you are shopping from{' '}
                  <strong className="text-[#8E6E2F] font-semibold">{countryDisplay}</strong>.
                </p>
              </div>
            </div>

            {/* Currency Info Card */}
            <div
              className={`
                w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border
                ${isEthiopia
                  ? 'bg-[#FAF6EE] border-[#D8C6A8]'
                  : 'bg-[#FAF6EE] border-[#D8C6A8]'
                }
              `}
            >
              <div
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isEthiopia ? 'bg-[#E6D5B8]' : 'bg-[#E6D5B8]'}
                `}
              >
                <MapPin className={`w-4.5 h-4.5 ${isEthiopia ? 'text-[#8E6E2F]' : 'text-[#8E6E2F]'}`} />
              </div>
              <div className="text-left">
                <p className="text-[11px] text-[#756457] uppercase tracking-widest font-bold leading-none mb-0.5">
                  {isEthiopia ? 'Ethiopia Market' : 'International Market'}
                </p>
                <p className="text-sm text-[#241A15] font-semibold leading-snug">
                  Prices &amp; checkout in{' '}
                  <span className={`font-bold ${isEthiopia ? 'text-[#8E6E2F]' : 'text-[#8E6E2F]'}`}>
                    {currency === 'ETB' ? 'ETB (Ethiopian Birr)' : 'USD (US Dollar)'}
                  </span>
                </p>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#756457]/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Market is securely assigned based on your location</span>
            </div>

            {/* CTA Button */}
            <button
              id="market-welcome-continue-btn"
              onClick={confirmMarket}
              className={`
                w-full font-podium text-base uppercase tracking-widest py-4 px-6 rounded-2xl
                font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                shadow-md flex items-center justify-center gap-2.5 cursor-pointer
                bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] shadow-[#241A15]/15
              `}
            >
              <Gift className="w-4.5 h-4.5 text-[#E6D5B8]" />
              Continue Shopping
            </button>

            <p className="text-[10px] text-[#756457]/70 leading-relaxed px-2">
              You can request a region change from the website footer if needed.
            </p>
          </div>

          {/* Bottom Accent Bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#D8C6A8] to-transparent" />
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
