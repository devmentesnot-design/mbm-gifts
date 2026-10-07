import React, { useEffect } from 'react';
import { ShoppingBag, ArrowRight, X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AddToCartToastProps {
  itemName: string;
  onViewCart: () => void;
  onClose: () => void;
}

export const AddToCartToast: React.FC<AddToCartToastProps> = ({ itemName, onViewCart, onClose }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm w-full bg-[#FBF8F2]/95 border border-[#D8C6A8] rounded-2xl p-4 shadow-[0_12px_36px_rgba(58,42,32,0.18)] backdrop-blur-md flex items-center gap-3">
      <div className="bg-[#E6D5B8] text-[#241A15] rounded-xl p-2.5 flex-shrink-0 font-bold shadow-sm">
        <Check className="w-5 h-5 stroke-[3] text-[#8E6E2F]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[#8E6E2F] font-bold text-xs uppercase tracking-wider">
          {t('shop.added')}
        </p>
        <p className="text-[#241A15] text-xs font-semibold truncate mt-0.5">
          {itemName}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            onViewCart();
            onClose();
          }}
          className="bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
        >
          <span>{t('cart.viewCart')}</span>
          <ArrowRight className="w-3 h-3 text-[#E6D5B8]" />
        </button>

        <button
          onClick={onClose}
          className="text-[#756457] hover:text-[#241A15] p-1 rounded transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
