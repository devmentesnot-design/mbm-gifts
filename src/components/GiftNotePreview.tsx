import React from 'react';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';

interface GiftNotePreviewProps {
  recipientName: string;
  senderName: string;
  giftMessage: string;
}

/**
 * Live gift note preview — fixed to Royal Ivory theme & Calligraphy font only.
 * Theme/font controls removed per design spec.
 */
export const GiftNotePreview: React.FC<GiftNotePreviewProps> = ({
  recipientName,
  senderName,
  giftMessage,
}) => {
  return (
    <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <h3 className="font-podium text-xl uppercase tracking-wider text-white">Live Gift Note Preview</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] bg-amber-400/10 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hand-Printed on Heavy Cardstock</span>
        </div>
      </div>

      {/* Realistic Printed Card — Royal Ivory + Calligraphy only */}
      <div className="relative rounded-2xl border-2 p-6 sm:p-8 shadow-2xl overflow-hidden bg-[#faf6ee] border-amber-600/40 text-[#2a0407]">

        {/* Decorative Metallic Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600/50" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600/50" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600/50" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600/50" />

        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="font-podium text-xs tracking-widest uppercase opacity-70 text-[#8c1119]">
            ★ MBM GIFTS SIGNATURE COLLECTION ★
          </div>
          <div className="w-16 h-[1px] bg-amber-600/40 mx-auto mt-1" />
        </div>

        {/* Card Body */}
        <div className="space-y-4 max-w-lg mx-auto">
          {/* Recipient */}
          <div className="text-sm sm:text-base font-bold">
            <span className="text-xs uppercase tracking-wider opacity-50 block">To:</span>
            <span className="text-lg sm:text-xl text-[#8c1119] font-serif italic tracking-wide">
              {recipientName.trim() || 'Someone Very Special'}
            </span>
          </div>

          {/* Message */}
          <div className="text-sm sm:text-base leading-relaxed py-2 min-h-[70px] whitespace-pre-wrap font-serif italic tracking-wide text-[#2a0407]">
            {giftMessage.trim() ? (
              `"${giftMessage}"`
            ) : (
              <span className="opacity-40 italic">
                (Your personalized gift message will be elegantly printed here...)
              </span>
            )}
          </div>

          {/* Sender */}
          <div className="text-right pt-2 border-t border-amber-600/20">
            <span className="text-xs uppercase tracking-wider opacity-50 block">With Love &amp; Best Wishes,</span>
            <span className="text-base sm:text-lg font-bold text-[#8c1119] font-serif italic tracking-wide">
              {senderName.trim() || 'Your Name'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-end border-t border-amber-600/15 pt-4">
          <div className="text-[10px] uppercase tracking-widest opacity-40 flex items-center gap-1 text-[#2a0407]">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>Complimentary Enclosed Card</span>
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg bg-[#8c1119] text-amber-300">
            <span>MBM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>GIFTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
