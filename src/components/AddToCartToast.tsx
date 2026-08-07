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
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm w-full bg-[#380509] border border-amber-400/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center gap-3">
      <div className="bg-amber-400 text-[#8c1119] rounded-xl p-2.5 flex-shrink-0 font-bold">
        <Check className="w-5 h-5 stroke-[3]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-amber-300 font-bold text-xs uppercase tracking-wider">
          {t('shop.added')}
        </p>
        <p className="text-white text-xs font-medium truncate mt-0.5">
          {itemName}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            onViewCart();
            onClose();
          }}
          className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <span>{t('cart.viewCart')}</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={onClose}
          className="text-white/40 hover:text-white p-1 rounded transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
