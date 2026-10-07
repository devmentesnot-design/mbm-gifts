import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

export const AdvanceNoticeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('mbm_surprise_notice_seen');
    if (!hasSeenNotice) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('mbm_surprise_notice_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FBF8F2] border border-[#D8C6A8] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#756457] hover:text-[#241A15] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#FAF6EE] border border-[#D8C6A8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Gift className="w-8 h-8 text-[#8E6E2F]" />
          </div>

          <h2 className="font-podium text-2xl uppercase text-[#241A15] mb-4 tracking-wider">
            Planning a special surprise? 🎁
          </h2>

          <div className="space-y-4 text-sm text-[#756457] mb-8">
            <p>
              For the perfect experience, we recommend placing your order{' '}
              <strong className="text-[#3A2A20]">at least 7 days in advance</strong>.
            </p>
            <p>
              But don't worry — if you need it sooner,{' '}
              <strong className="text-[#3A2A20]">3 days in advance is still possible. ❤️</strong>
            </p>
            <p className="italic text-xs mt-4 opacity-80">
              *Order early when you can, and we'll take care of the rest.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest transition-all shadow-xl"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
