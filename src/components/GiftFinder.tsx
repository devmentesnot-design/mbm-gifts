import React, { useState } from 'react';
import { PREPARED_PACKAGES, PreparedPackage } from '../data/giftsData';
import { Sparkles, ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GiftFinderProps {
  onAddToCart: (pkg: PreparedPackage) => void;
}

export const GiftFinder: React.FC<GiftFinderProps> = ({ onAddToCart }) => {
  const { t } = useLanguage();
  const [recipient, setRecipient] = useState<string>('Partner');
  const [occasion, setOccasion] = useState<string>('Anniversary');
  const [budget, setBudget] = useState<string>('100-150');
  const [matchedPackage, setMatchedPackage] = useState<PreparedPackage>(PREPARED_PACKAGES[0]);

  const findMatch = () => {
    // Find best matching package logic
    let match = PREPARED_PACKAGES.find(p => {
      if (occasion === 'Anniversary' && p.category === 'Anniversary') return true;
      if (occasion === 'Birthday' && p.category === 'Birthday') return true;
      if (occasion === 'Romance' && p.category === 'Romance') return true;
      if (occasion === 'Corporate' && p.category === 'Corporate') return true;
      return false;
    });

    if (!match) {
      match = PREPARED_PACKAGES[0];
    }
    setMatchedPackage(match);
  };

  return (
    <section id="finder" className="w-full px-6 sm:px-10 lg:px-16 py-20 bg-gradient-to-r from-[#6e0d13] via-[#8c1119] to-[#6e0d13] text-white">
      <div className="max-w-5xl mx-auto bg-[#4a070c] border border-amber-400/40 rounded-xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-inter tracking-[0.25em] uppercase font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{t('finder.title')}</span>
          </div>
          <h2 className="font-podium text-2xl sm:text-4xl font-bold uppercase tracking-tight">
            {t('finder.subtitle')}
          </h2>
        </div>

        {/* 3 Quick Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 font-inter">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/70 mb-2">{t('finder.step1')}</label>
            <select
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                findMatch();
              }}
              className="w-full bg-black/40 border border-white/20 rounded p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Partner">Life Partner / Spouse</option>
              <option value="Friend">Best Friend</option>
              <option value="Colleague">Corporate Client / Boss</option>
              <option value="Parent">Parents / Family</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/70 mb-2">{t('finder.step2')}</label>
            <select
              value={occasion}
              onChange={(e) => {
                setOccasion(e.target.value);
                findMatch();
              }}
              className="w-full bg-black/40 border border-white/20 rounded p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Anniversary">Anniversary</option>
              <option value="Birthday">Birthday Celebration</option>
              <option value="Romance">Romance & Passion</option>
              <option value="Corporate">Executive / Appreciation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-white/70 mb-2">{t('finder.step3')}</label>
            <select
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                findMatch();
              }}
              className="w-full bg-black/40 border border-white/20 rounded p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="50-100">$50 - $100</option>
              <option value="100-150">$100 - $150</option>
              <option value="150+">$150+</option>
            </select>
          </div>
        </div>

        {/* Matched Recommendation Card */}
        {matchedPackage && (
          <div className="bg-black/30 border border-white/10 rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 animate-scale-in">
            <img
              src={matchedPackage.image}
              alt={matchedPackage.name}
              className="w-full sm:w-48 h-36 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] text-amber-300 tracking-widest uppercase font-inter font-bold">
                ★ {t('finder.resultTitle')}
              </span>
              <h3 className="font-podium text-xl uppercase font-bold text-white mt-1">
                {matchedPackage.name}
              </h3>
              <p className="text-white/70 text-xs font-inter line-clamp-2 my-2">
                {matchedPackage.shortDesc}
              </p>
              <div className="text-xl font-bold font-inter text-white">
                ${matchedPackage.price.toFixed(2)}
              </div>
            </div>

            <button
              onClick={() => onAddToCart(matchedPackage)}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-6 py-3.5 text-xs font-inter tracking-widest uppercase rounded flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('shop.addToCart')}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

