import React, { useState, useMemo } from 'react';
import { PreparedPackage } from '../data/giftsData';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMarket } from '../context/MarketContext';
import { formatPrice } from '../utils/currency';

interface GiftFinderProps {
  packages: PreparedPackage[];
  onAddToCart: (pkg: PreparedPackage) => void;
}

export const GiftFinder: React.FC<GiftFinderProps> = ({ packages, onAddToCart }) => {
  const { t } = useLanguage();
  const { buyerMarket, currency } = useMarket();
  const [recipient, setRecipient] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');
  const [budget, setBudget] = useState<string>('');

  const getPkgPrice = (pkg: PreparedPackage): number => {
    if (buyerMarket === 'INTERNATIONAL') {
      if (pkg.price_usd != null && pkg.price_usd > 0) return pkg.price_usd;
      return Math.round((pkg.price / 120) * 100) / 100;
    }
    return pkg.price;
  };

  // Extract unique occasions from real packages
  const occasions = useMemo(() => {
    const unique = new Set(packages.map(p => p.category));
    return Array.from(unique).sort();
  }, [packages]);

  // Filter packages based on selections
  const matchedPackage = useMemo(() => {
    let filtered = [...packages];

    // Filter by occasion
    if (occasion) {
      filtered = filtered.filter(p => p.category === occasion);
    }

    // Filter by budget
    if (budget) {
      const [min, max] = budget.split('-').map(v => v === '+' ? Infinity : parseFloat(v));
      filtered = filtered.filter(p => {
        const price = getPkgPrice(p);
        return price >= min && (max === Infinity || price <= max);
      });
    }

    // Return first match or first package
    return filtered.length > 0 ? filtered[0] : packages[0];
  }, [packages, occasion, budget, buyerMarket]);

  return (
    <section id="finder" className="w-full px-4 sm:px-8 lg:px-12 py-12 sm:py-16 text-[#FFF8ED] relative">
      <div className="max-w-4xl mx-auto luxury-satin-card rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative top gold bar */}
        <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#D9A514]/50 to-transparent" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-[#F5C542] text-xs font-inter tracking-[0.2em] uppercase font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Gift Assistant</span>
          </div>
          <h2 className="font-podium text-2xl sm:text-4xl font-extrabold text-[#FFF8ED] uppercase">
            Find The Perfect Gift
          </h2>
        </div>

        {/* 3 Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 font-inter">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#F5C542] font-bold mb-1.5">Who is this gift for?</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-[#1a0004]/80 border border-[#D9A514]/25 rounded-xl p-3 text-sm text-[#FFF8ED] focus:outline-none focus:border-[#F5C542] cursor-pointer"
            >
              <option value="">Anyone</option>
              <option value="Partner">Life Partner / Spouse</option>
              <option value="Friend">Best Friend</option>
              <option value="Colleague">Corporate Client</option>
              <option value="Parent">Parents / Family</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#F5C542] font-bold mb-1.5">What is the occasion?</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-[#1a0004]/80 border border-[#D9A514]/25 rounded-xl p-3 text-sm text-[#FFF8ED] focus:outline-none focus:border-[#F5C542] cursor-pointer"
            >
              <option value="">All Occasions</option>
              {occasions.map(occ => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#F5C542] font-bold mb-1.5">Preferred Budget?</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-[#1a0004]/80 border border-[#D9A514]/25 rounded-xl p-3 text-sm text-[#FFF8ED] focus:outline-none focus:border-[#F5C542] cursor-pointer"
            >
              <option value="">Any Budget</option>
              {buyerMarket === 'INTERNATIONAL' ? (
                <>
                  <option value="0-30">Under $30</option>
                  <option value="30-60">$30 - $60</option>
                  <option value="60-100">$60 - $100</option>
                  <option value="100-+">$100+</option>
                </>
              ) : (
                <>
                  <option value="0-2000">Under 2,000 ብር</option>
                  <option value="2000-5000">2,000 - 5,000 ብር</option>
                  <option value="5000-10000">5,000 - 10,000 ብር</option>
                  <option value="10000-+">10,000+ ብር</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Matched Package */}
        {matchedPackage && (
          <div className="bg-[#230005]/80 border border-[#D9A514]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 animate-scale-in backdrop-blur-sm shadow-xl">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
              <img
                src={matchedPackage.image}
                alt={matchedPackage.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] text-[#F5C542] tracking-widest uppercase font-inter font-bold">
                ★ Recommended For You
              </span>
              <h3 className="font-podium text-lg sm:text-xl font-bold text-[#FFF8ED] mt-1">
                {matchedPackage.name}
              </h3>
              <p className="text-[#FFF8ED]/70 text-xs font-inter line-clamp-2 my-2">
                {matchedPackage.shortDesc}
              </p>
              <div className="text-lg font-bold font-inter text-[#F5C542]">
                {formatPrice(getPkgPrice(matchedPackage), currency)}
              </div>
            </div>

            <button
              onClick={() => onAddToCart(matchedPackage)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#F5C542] to-[#D9A514] hover:from-[#F5C542] hover:to-[#e6b015] text-[#2B0005] font-extrabold px-6 py-3 text-xs font-inter tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all flex-shrink-0 cursor-pointer shadow-lg shadow-[#D9A514]/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

