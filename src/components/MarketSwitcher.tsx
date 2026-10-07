import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useMarket, BuyerMarket } from '../context/MarketContext';
import { CartItem } from '../types/cart';

interface MarketSwitcherProps {
  cartItems?: CartItem[];
  onMarketChange?: (newMarket: BuyerMarket) => void;
  compact?: boolean;
}

/**
 * @deprecated Legacy MarketSwitcher. Use MarketWelcomeModal and MarketChangeRequest instead.
 */
export const MarketSwitcher: React.FC<MarketSwitcherProps> = ({
  cartItems = [],
  onMarketChange,
}) => {
  const { buyerMarket, currency, requestMarketChange } = useMarket();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMarket, setPendingMarket] = useState<BuyerMarket | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMarket = (targetMarket: BuyerMarket) => {
    if (targetMarket === buyerMarket) {
      setIsOpen(false);
      return;
    }

    if (cartItems.length > 0) {
      setPendingMarket(targetMarket);
      setShowConfirmModal(true);
      setIsOpen(false);
      return;
    }

    executeMarketSwitch(targetMarket);
  };

  const executeMarketSwitch = async (targetMarket: BuyerMarket) => {
    await requestMarketChange(targetMarket);
    if (onMarketChange) {
      onMarketChange(targetMarket);
    }
    setIsOpen(false);
    setShowConfirmModal(false);
    setPendingMarket(null);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-inter text-xs tracking-wider cursor-pointer ${
            buyerMarket === 'INTERNATIONAL'
              ? 'bg-[#E6D5B8]/60 border-[#D8C6A8] text-[#241A15] shadow-sm'
              : 'bg-[#FAF6EE] border-[#D8C6A8] text-[#241A15] hover:bg-[#E6D5B8]/40'
          }`}
          title="Switch Buyer Market & Currency"
        >
          <span className="text-base leading-none">
            {buyerMarket === 'ETHIOPIA' ? '🇪🇹' : '🌍'}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest leading-none text-[#241A15]">
              {buyerMarket === 'ETHIOPIA' ? 'Ethiopia' : 'Abroad'}
            </span>
            <span className="text-[9px] text-[#8E6E2F] font-semibold tracking-wider leading-none mt-0.5">
              {currency} {buyerMarket === 'INTERNATIONAL' && '• Free Delivery'}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-[#8E6E2F] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-[#FBF8F2] border border-[#D8C6A8] shadow-2xl py-2 z-50 animate-scale-in backdrop-blur-xl text-[#241A15]">
            <div className="px-4 py-2 border-b border-[#D8C6A8]/40">
              <p className="text-[10px] uppercase tracking-widest text-[#8E6E2F] font-bold">Shopping Experience</p>
              <p className="text-[11px] text-[#756457] mt-0.5">Where are you ordering from?</p>
            </div>

            <div className="p-1.5 space-y-1">
              {/* ETHIOPIA OPTION */}
              <button
                type="button"
                onClick={() => handleSelectMarket('ETHIOPIA')}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  buyerMarket === 'ETHIOPIA'
                    ? 'bg-[#E6D5B8]/40 border border-[#D8C6A8] text-[#241A15]'
                    : 'hover:bg-[#FAF6EE] text-[#3A2A20]'
                }`}
              >
                <span className="text-2xl">🇪🇹</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#241A15]">Buying from Ethiopia</span>
                    {buyerMarket === 'ETHIOPIA' && <Check className="w-3.5 h-3.5 text-[#8E6E2F]" />}
                  </div>
                  <p className="text-[10px] text-[#8E6E2F] font-semibold mt-0.5">Prices in ETB (ብር)</p>
                  <p className="text-[9px] text-[#756457] mt-0.5">Telebirr, CBE &amp; Ethiopian Bank Transfer</p>
                </div>
              </button>

              {/* INTERNATIONAL OPTION */}
              <button
                type="button"
                onClick={() => handleSelectMarket('INTERNATIONAL')}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  buyerMarket === 'INTERNATIONAL'
                    ? 'bg-[#E6D5B8]/40 border border-[#D8C6A8] text-[#241A15]'
                    : 'hover:bg-[#FAF6EE] text-[#3A2A20]'
                }`}
              >
                <span className="text-2xl">🌍</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#241A15]">Buying from Abroad</span>
                    {buyerMarket === 'INTERNATIONAL' && <Check className="w-3.5 h-3.5 text-[#8E6E2F]" />}
                  </div>
                  <p className="text-[10px] text-[#8E6E2F] font-semibold mt-0.5">Prices in USD ($)</p>
                  <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">✨ FREE Delivery inside Ethiopia</p>
                  <p className="text-[9px] text-[#756457] mt-0.5">Direct Transfer &amp; Receipt Verification</p>
                </div>
              </button>
            </div>

            <div className="px-4 py-2 border-t border-[#D8C6A8]/40 bg-[#FAF6EE] text-[9px] text-[#756457] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#8E6E2F] flex-shrink-0" />
              <span>Gifts are always hand-delivered in Ethiopia</span>
            </div>
          </div>
        )}
      </div>

      {/* Cart Market Change Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#241A15]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FBF8F2] border border-[#D8C6A8] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in font-inter text-[#241A15]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E6D5B8] border border-[#D8C6A8] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-[#8E6E2F]" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#241A15]">Switch Shopping Market?</h3>
                <p className="text-xs text-[#756457]">Currency and payment rules will update</p>
              </div>
            </div>

            <p className="text-xs text-[#3A2A20] leading-relaxed mb-5">
              You currently have items in your cart. Switching to{' '}
              <strong className="text-[#8E6E2F]">
                {pendingMarket === 'ETHIOPIA' ? 'Ethiopia (ETB)' : 'Abroad (USD)'}
              </strong>{' '}
              will update product pricing and delivery currency to ensure correct billing.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingMarket(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#756457] hover:text-[#241A15] hover:bg-[#E6D5B8]/30 transition-colors border border-[#D8C6A8]"
              >
                Keep Current
              </button>
              <button
                type="button"
                onClick={() => pendingMarket && executeMarketSwitch(pendingMarket)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] transition-all shadow-md"
              >
                Switch to {pendingMarket === 'ETHIOPIA' ? 'ETB' : 'USD'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

