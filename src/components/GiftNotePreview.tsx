import React, { useState } from 'react';
import { Heart, Sparkles, Edit3, CheckCircle2, ShieldCheck } from 'lucide-react';

interface GiftNotePreviewProps {
  recipientName: string;
  senderName: string;
  giftMessage: string;
  onUpdateRecipient?: (name: string) => void;
  onUpdateSender?: (name: string) => void;
  onUpdateMessage?: (message: string) => void;
}

export const GiftNotePreview: React.FC<GiftNotePreviewProps> = ({
  recipientName,
  senderName,
  giftMessage,
  onUpdateRecipient,
  onUpdateSender,
  onUpdateMessage,
}) => {
  const [cardTheme, setCardTheme] = useState<'crimson' | 'ivory' | 'onyx' | 'rose'>('crimson');
  const [fontStyle, setFontStyle] = useState<'serif' | 'script' | 'sans'>('script');

  const themes = [
    { id: 'crimson', name: 'Crimson & Gold', bg: 'bg-[#3d0308]', border: 'border-amber-400/60', text: 'text-amber-100', accent: 'text-amber-300', sealBg: 'bg-amber-400 text-[#8c1119]' },
    { id: 'ivory', name: 'Royal Ivory', bg: 'bg-[#faf6ee]', border: 'border-amber-600/40', text: 'text-[#2a0407]', accent: 'text-[#8c1119]', sealBg: 'bg-[#8c1119] text-amber-300' },
    { id: 'onyx', name: 'Midnight Onyx', bg: 'bg-[#121212]', border: 'border-white/30', text: 'text-slate-100', accent: 'text-amber-400', sealBg: 'bg-amber-400 text-black' },
    { id: 'rose', name: 'Blush Satin', bg: 'bg-[#4a101b]', border: 'border-pink-300/40', text: 'text-pink-100', accent: 'text-pink-300', sealBg: 'bg-pink-300 text-[#4a101b]' },
  ];

  const currentTheme = themes.find(t => t.id === cardTheme) || themes[0];

  const getFontFamilyClass = () => {
    switch (fontStyle) {
      case 'script':
        return 'font-serif italic tracking-wide';
      case 'serif':
        return 'font-serif tracking-tight';
      case 'sans':
        return 'font-sans tracking-wide';
    }
  };

  return (
    <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <h3 className="font-podium text-xl uppercase tracking-wider text-white">Live Gift Note Preview</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] bg-amber-400/10 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hand-Printed on Heavy Cardstock</span>
        </div>
      </div>

      {/* Controls Bar for Theme & Font Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
        <div>
          <span className="text-white/50 text-[10px] uppercase font-bold tracking-widest block mb-1">Card Theme</span>
          <div className="flex gap-1.5 flex-wrap">
            {themes.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCardTheme(t.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  cardTheme === t.id 
                    ? 'bg-amber-400 text-[#8c1119] shadow-md scale-105' 
                    : 'bg-black/40 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-white/50 text-[10px] uppercase font-bold tracking-widest block mb-1">Font Style</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setFontStyle('script')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold italic transition-all cursor-pointer ${
                fontStyle === 'script' ? 'bg-amber-400 text-[#8c1119]' : 'bg-black/40 text-white/60 border border-white/10'
              }`}
            >
              Calligraphy
            </button>
            <button
              type="button"
              onClick={() => setFontStyle('serif')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold font-serif transition-all cursor-pointer ${
                fontStyle === 'serif' ? 'bg-amber-400 text-[#8c1119]' : 'bg-black/40 text-white/60 border border-white/10'
              }`}
            >
              Serif
            </button>
            <button
              type="button"
              onClick={() => setFontStyle('sans')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                fontStyle === 'sans' ? 'bg-amber-400 text-[#8c1119]' : 'bg-black/40 text-white/60 border border-white/10'
              }`}
            >
              Modern
            </button>
          </div>
        </div>
      </div>

      {/* Realistic Printed Card Display Canvas */}
      <div className={`relative rounded-2xl border-2 p-6 sm:p-8 transition-all duration-300 shadow-2xl overflow-hidden ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text}`}>
        
        {/* Decorative Metallic Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400/60"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400/60"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400/60"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400/60"></div>

        {/* Card Header Branding */}
        <div className="text-center mb-6">
          <div className={`font-podium text-xs tracking-widest uppercase opacity-80 ${currentTheme.accent}`}>
            ★ MBM GIFTS SIGNATURE COLLECTION ★
          </div>
          <div className="w-16 h-[1px] bg-current opacity-30 mx-auto mt-1"></div>
        </div>

        {/* Card Body Message */}
        <div className="space-y-4 max-w-lg mx-auto">
          {/* Recipient Header */}
          <div className="text-sm sm:text-base font-bold">
            <span className="text-xs uppercase tracking-wider opacity-60 block">To:</span>
            <span className={`text-lg sm:text-xl ${currentTheme.accent} ${getFontFamilyClass()}`}>
              {recipientName.trim() || 'Someone Very Special'}
            </span>
          </div>

          {/* Main Body Message */}
          <div className={`text-sm sm:text-base leading-relaxed py-2 min-h-[70px] whitespace-pre-wrap ${getFontFamilyClass()}`}>
            {giftMessage.trim() ? (
              `"${giftMessage}"`
            ) : (
              <span className="opacity-40 italic">
                (Your personalized gift message will be elegantly printed here...)
              </span>
            )}
          </div>

          {/* Sender Footer */}
          <div className="text-right pt-2 border-t border-current/15">
            <span className="text-xs uppercase tracking-wider opacity-60 block">With Love & Best Wishes,</span>
            <span className={`text-base sm:text-lg font-bold ${currentTheme.accent} ${getFontFamilyClass()}`}>
              {senderName.trim() || 'Your Name'}
            </span>
          </div>
        </div>

        {/* Embossed Gold Wax Seal Badge */}
        <div className="mt-6 flex justify-between items-end border-t border-current/10 pt-4">
          <div className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>Complimentary Enclosed Card</span>
          </div>

          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg ${currentTheme.sealBg}`}>
            <span>MBM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            <span>GIFTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
