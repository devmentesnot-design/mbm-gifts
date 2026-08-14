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
    <section id="finder" className="w-full px-4 sm:px-8 lg:px-12 py-12 sm:py-16 bg-gradient-to-r from-[#6e0d13] via-[#8c1119] to-[#6e0d13] text-white">
      <div className="max-w-4xl mx-auto bg-[#4a070c] border border-amber-400/40 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-inter tracking-[0.2em] uppercase font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Gift Assistant</span>
          </div>
          <h2 className="font-podium text-xl sm:text-3xl font-bold">
            Find The Perfect Gift
          </h2>
        </div>

        {/* 3 Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 font-inter">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-300/90 font-bold mb-1.5">Who is this gift for?</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">Anyone</option>
              <option value="Partner">Life Partner / Spouse</option>
              <option value="Friend">Best Friend</option>
              <option value="Colleague">Corporate Client</option>
              <option value="Parent">Parents / Family</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-300/90 font-bold mb-1.5">What is the occasion?</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">All Occasions</option>
              {occasions.map(occ => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-amber-300/90 font-bold mb-1.5">Preferred Budget?</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
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
          <div className="bg-black/30 border border-amber-400/20 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 animate-scale-in">
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
              <img
                src={matchedPackage.image}
                alt={matchedPackage.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] text-amber-300 tracking-widest uppercase font-inter font-bold">
                ★ Recommended For You
              </span>
              <h3 className="font-podium text-lg sm:text-xl font-bold text-white mt-1">
                {matchedPackage.name}
              </h3>
              <p className="text-white/70 text-xs font-inter line-clamp-2 my-2">
                {matchedPackage.shortDesc}
              </p>
              <div className="text-lg font-bold font-inter text-amber-300">
                {formatPrice(getPkgPrice(matchedPackage), currency)}
              </div>
            </div>

            <button
              onClick={() => onAddToCart(matchedPackage)}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-5 py-2.5 text-xs font-inter tracking-wider uppercase rounded-lg flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer shadow-md"
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

