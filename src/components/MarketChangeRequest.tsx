import React, { useState } from 'react';
import { Globe, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useMarket, BuyerMarket } from '../context/MarketContext';

/**
 * MarketChangeRequest
 *
 * A low-profile footer component that lets customers request a region change.
 * NOT a casual switcher — re-runs IP detection to validate the request.
 * Only allow when IP confirms the new market or detection is ambiguous.
 */
export const MarketChangeRequest: React.FC = () => {
  const { buyerMarket, currency, buyerCountryName, requestMarketChange } = useMarket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; reason?: string } | null>(null);

  const targetMarket: BuyerMarket = buyerMarket === 'ETHIOPIA' ? 'INTERNATIONAL' : 'ETHIOPIA';
  const targetLabel = targetMarket === 'ETHIOPIA' ? 'Ethiopia (ETB)' : 'International (USD)';
  const currentLabel =
    buyerMarket === 'ETHIOPIA'
      ? `Ethiopia (${currency})`
      : `${buyerCountryName ? buyerCountryName + ' ' : ''}International (${currency})`;

  const handleOpenModal = () => {
    setResult(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setResult(null);
    setIsProcessing(false);
  };

  const handleConfirmChange = async () => {
    setIsProcessing(true);
    setResult(null);
    const res = await requestMarketChange(targetMarket);
    setResult(res);
    setIsProcessing(false);
    if (res.success) {
      // Close modal after a brief success display
      setTimeout(() => {
        handleClose();
        // Reload to re-render all price displays with new market
        window.location.reload();
      }, 1800);
    }
  };

  return (
    <>
      {/* Inline footer indicator */}
      <div className="flex items-center gap-2 text-[11px] text-[#F7F1E7]/60">
        <Globe className="w-3.5 h-3.5 text-[#E6D5B8] flex-shrink-0" />
        <span>Shopping in {currentLabel}</span>
        <span className="text-[#F7F1E7]/30">•</span>
        <button
          id="market-change-region-btn"
          onClick={handleOpenModal}
          className="text-[#E6D5B8] hover:text-[#FAF6EE] underline underline-offset-2 cursor-pointer transition-colors"
          title="Request a region change"
        >
          Change Region
        </button>
      </div>

      {/* Change Region Modal */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9990] bg-[#241A15]/70 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Change Shopping Region"
            className="fixed inset-0 z-[9991] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm bg-[#FBF8F2] border border-[#D8C6A8] rounded-2xl shadow-2xl overflow-hidden animate-scale-in font-inter text-[#241A15]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8C6A8]/40">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#8E6E2F]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#241A15]">
                    Change Shopping Region
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-[#E6D5B8]/30 rounded-lg text-[#756457] hover:text-[#241A15] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-5 space-y-4">
                {/* Explanation */}
                <div className="bg-[#FAF6EE] border border-[#D8C6A8] rounded-xl px-4 py-3 text-xs text-[#3A2A20] leading-relaxed">
                  <p>
                    Your shopping region is automatically assigned based on your location.
                    To switch to{' '}
                    <strong className="text-[#8E6E2F]">{targetLabel}</strong>, we will
                    re-verify your current location.
                  </p>
                </div>

                {/* Result feedback */}
                {result && (
                  <div
                    className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs leading-relaxed border ${
                      result.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800'
                        : 'bg-red-500/10 border-red-500/30 text-red-800'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                    )}
                    <span>
                      {result.success
                        ? 'Region updated! Reloading your shopping experience...'
                        : result.reason || 'Region change could not be completed.'}
                    </span>
                  </div>
                )}

                {/* Info note for denial */}
                {result && !result.success && (
                  <p className="text-[11px] text-[#756457] leading-relaxed">
                    If you believe this is an error, please contact our support team at{' '}
                    <a
                      href="mailto:info@mbmgifts.app"
                      className="text-[#8E6E2F] underline font-semibold"
                    >
                      info@mbmgifts.app
                    </a>{' '}
                    and we will assist you.
                  </p>
                )}
              </div>

              {/* Footer Actions */}
              {!result?.success && (
                <div className="px-5 pb-5 flex items-center gap-3">
                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#756457] hover:text-[#241A15] hover:bg-[#E6D5B8]/30 transition-colors border border-[#D8C6A8] cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    id="market-change-confirm-btn"
                    onClick={handleConfirmChange}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Switch to {targetLabel}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
