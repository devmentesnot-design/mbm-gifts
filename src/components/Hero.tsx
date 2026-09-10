import React from 'react';
import { ArrowUpRight, Award, Crown, Sparkles, PackageCheck, Globe, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMarket } from '../context/MarketContext';
import { HeroPackageShowcase } from './HeroPackageShowcase';
import { PreparedPackage } from '../data/giftsData';

interface HeroProps {
  onExplorePackages: () => void;
  onOpenCustomizer?: () => void;
  packages?: PreparedPackage[];
  onViewPackageDetail?: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExplorePackages,
  packages = [],
  onViewPackageDetail,
}) => {
  const { t } = useLanguage();
  const { buyerMarket } = useMarket();

  return (
    <section className="relative min-h-[calc(100vh-76px)] w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Subtle Vignette for dramatic depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(43,0,5,0.75)_100%)] -z-25 pointer-events-none" />

      {/* Soft spotlight highlight over satin fabric */}
      <div className="animate-fade-in-delay absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,_rgba(245,197,66,0.12)_0%,_rgba(255,255,255,0.08)_25%,_transparent_65%)] -z-20 pointer-events-none" />

      {/* Main Hero Container: Two-Column Responsive Layout */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 flex-1 flex flex-col lg:flex-row items-center justify-between z-10 py-6 sm:py-8 lg:py-10 gap-8 lg:gap-12 xl:gap-16">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: HERO HEADLINE, CTAS, STATS                                   */}
        {/* ========================================================================= */}
        <div className="w-full lg:max-w-2xl xl:max-w-3xl flex flex-col justify-center">
          {/* Market-aware Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-2 bg-[#D9A514]/15 border border-[#D9A514]/40 text-[#F5C542] text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full shadow-md">
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#F5C542]" />
              <span>{t('hero.badge')}</span>
            </div>

            {buyerMarket === 'INTERNATIONAL' && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full animate-fade-in shadow-md">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pay USD • Free Delivery in Ethiopia</span>
              </div>
            )}
          </div>

          {/* Main Heading */}
          <h1 className="animate-fade-up-delay-1 font-podium font-black text-[#FFF8ED] uppercase tracking-tight text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.6rem] xl:text-[4.2rem] leading-[1.08] drop-shadow-xl mt-2">
            <span className="block text-[#F5C542] font-black">BESPOKE GIFTS</span>
            <span className="block text-[#FFF8ED] mt-1">FOR EVERY</span>
            <span className="block text-[#FFF8ED]">MILESTONE</span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up-delay-2 mt-4 sm:mt-6 lg:mt-7 text-[#FFF8ED]/85 text-xs sm:text-sm md:text-base font-inter leading-relaxed max-w-full sm:max-w-lg">
            {buyerMarket === 'INTERNATIONAL'
              ? 'Ordering from abroad? Send luxury gift packages directly to loved ones, partners, and family in Ethiopia with complimentary hand-delivery.'
              : t('hero.subtitle')}
          </p>

          {/* CTA Row */}
          <div className="animate-fade-up-delay-3 mt-6 sm:mt-8 lg:mt-9 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
            <button
              onClick={onExplorePackages}
              className="group bg-gradient-to-r from-[#F5C542] to-[#D9A514] hover:from-[#F5C542] hover:to-[#e6b015] text-[#2B0005] px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-[11px] md:text-xs tracking-widest uppercase flex items-center gap-2 font-inter font-extrabold transition-all duration-300 cursor-pointer rounded-full shadow-xl shadow-[#D9A514]/25 hover:shadow-[#D9A514]/40 transform hover:-translate-y-0.5"
            >
              <span>{t('hero.exploreBtn')}</span>
              <ArrowUpRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <div className="hidden sm:flex items-center gap-3 border-l border-white/15 pl-4 sm:pl-6">
              <Award className="w-7 sm:w-8 h-7 sm:h-8 text-[#F5C542] flex-shrink-0" />
              <div className="text-[#FFF8ED]/80 text-[10px] sm:text-xs tracking-wider uppercase font-inter leading-tight">
                <div>Top-Rated</div>
                <div>Gift Studio</div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="animate-fade-up-delay-4 mt-6 sm:mt-8 md:mt-10 lg:mt-12 flex flex-wrap gap-5 sm:gap-7 md:gap-8 lg:gap-10 xl:gap-14">
            <div>
              <div className="font-inter text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                12,500+
              </div>
              <div className="text-white/60 text-[8px] sm:text-[9px] md:text-xs tracking-widest uppercase mt-0.5 sm:mt-1">
                {t('hero.stat1')}
              </div>
            </div>

            <div>
              <div className="font-inter text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                99.2%
              </div>
              <div className="text-white/60 text-[8px] sm:text-[9px] md:text-xs tracking-widest uppercase mt-0.5 sm:mt-1">
                {t('hero.stat2')}
              </div>
            </div>

            <div>
              <div className="font-inter text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                100%
              </div>
              <div className="text-white/60 text-[8px] sm:text-[9px] md:text-xs tracking-widest uppercase mt-0.5 sm:mt-1 flex items-center gap-1">
                <PackageCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-300" />
                <span>{t('hero.stat3')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: FLOATING READY-MADE PACKAGE SHOWCASE ON LUXURY PEDESTAL     */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-auto flex-1 flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
          <HeroPackageShowcase
            packages={packages}
            onSelectPackage={onViewPackageDetail}
            onExplorePackages={onExplorePackages}
          />
        </div>
      </div>

      {/* Hero Bottom Bar */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-2.5 sm:py-3 lg:py-5 z-10 flex items-center justify-between text-[8px] sm:text-[9px] md:text-[10px] text-white/40 font-inter tracking-widest uppercase border-t border-white/10">
        <div>© MBM GIFTS</div>
        <div className="hidden sm:block">LUXURY COLLECTION</div>
      </div>
    </section>
  );
};

