import React from 'react';
import { ArrowUpRight, Award, Sparkles, PackageCheck, Truck } from 'lucide-react';
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
    <section 
      className="relative w-full lg:aspect-[2089/753] min-h-0 lg:max-h-[640px] overflow-hidden flex flex-col justify-between select-none bg-transparent"
    >
      {/* Desktop Real Hero Background (Panoramic header image fitted cleanly) */}
      <img
        src="/elegant-thank-you.png"
        alt="MBM Luxury Gift Arrangement"
        className="hidden lg:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
        loading="eager"
      />

      {/* Bottom fade: dissolves hero image into page bg (no hard cut line) */}
      <div
        className="hidden lg:block absolute bottom-0 left-0 right-0 z-[1] pointer-events-none"
        style={{ height: '38%', background: 'linear-gradient(to top, #F7F1E7 0%, rgba(247,241,231,0.82) 30%, rgba(247,241,231,0.35) 65%, transparent 100%)' }}
      />

      {/* Mobile Folded Satin Background (Matches other pages and sections) */}
      <div 
        className="lg:hidden absolute inset-0 bg-cover bg-center pointer-events-none -z-10"
        style={{ backgroundImage: "url('/global-satin-bg.png')" }}
      />

      {/* Main Hero Container: Left Content & Right Promo Popup */}
      <div className="w-full h-full px-5 sm:px-8 md:px-10 lg:px-14 xl:px-18 flex-1 flex flex-col lg:flex-row items-center justify-between z-10 py-5 lg:py-8 gap-4 lg:gap-6">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: HERO HEADLINE, CTAS, STATS (Strictly confined to left silk)   */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[33%] xl:w-[29%] lg:max-w-[350px] xl:max-w-[410px] flex flex-col justify-center">
          {/* Market-aware Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-3.5">
            <div className="inline-flex items-center gap-1.5 bg-[#E6D5B8]/85 border border-[#D8C6A8] text-[#8E6E2F] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#B8944A]" />
              <span>{t('hero.badge')}</span>
            </div>

            {buyerMarket === 'INTERNATIONAL' && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full animate-fade-in shadow-sm">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>USD • Free Delivery</span>
              </div>
            )}
          </div>

          {/* Main Heading */}
          <h1 className="animate-fade-up-delay-1 font-podium font-black uppercase tracking-tight text-[2.1rem] sm:text-[2.6rem] lg:text-[2.4rem] xl:text-[2.95rem] leading-[1.05]">
            <span className="block font-black" style={{color: '#7A5C1E', textShadow: '0 1px 8px rgba(255,255,255,0.7)'}}>BESPOKE GIFTS</span>
            <span className="block mt-0.5" style={{color: '#1A1008', textShadow: '0 1px 6px rgba(255,255,255,0.5)'}}>FOR EVERY</span>
            <span className="block" style={{color: '#1A1008', textShadow: '0 1px 6px rgba(255,255,255,0.5)'}}>MILESTONE</span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up-delay-2 mt-3 sm:mt-3.5 text-[#3A2A20]/90 text-[13px] sm:text-[14px] lg:text-[13px] xl:text-[14.5px] font-inter leading-relaxed max-w-[340px] xl:max-w-[380px]">
            {buyerMarket === 'INTERNATIONAL'
              ? 'Ordering from abroad? Send luxury gift packages directly to loved ones in Ethiopia with complimentary VIP delivery.'
              : t('hero.subtitle')}
          </p>

          {/* CTA Row */}
          <div className="animate-fade-up-delay-3 mt-4 sm:mt-5 flex items-center gap-3.5">
            <button
              onClick={onExplorePackages}
              className="group bg-gradient-to-r from-[#E6D5B8] via-[#F7F1E7] to-[#E6D5B8] hover:from-[#ecdcc2] hover:to-[#dfcaa8] text-[#241A15] border border-[#D8C6A8] px-6 sm:px-7 py-3 sm:py-3.5 text-[11px] sm:text-xs tracking-wider uppercase flex items-center gap-2 font-inter font-extrabold transition-all duration-300 cursor-pointer rounded-full shadow-md shadow-[#B8944A]/10 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span>{t('hero.exploreBtn')}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#B8944A]" />
            </button>

            <div className="flex items-center gap-2 border-l border-[#D8C6A8]/60 pl-3.5">
              <Award className="w-6 h-6 text-[#B8944A] flex-shrink-0" />
              <div className="text-[#756457] text-[10px] tracking-wider uppercase font-inter leading-tight">
                <div className="font-semibold text-[#241A15]">Top-Rated</div>
                <div>Studio</div>
              </div>
            </div>
          </div>

          {/* Compact Stats Bar (Confined strictly under button on left) */}
          <div className="animate-fade-up-delay-4 mt-4.5 lg:mt-5 flex items-center gap-3.5 sm:gap-5 pt-3.5 border-t border-[#D8C6A8]/50 max-w-[330px]">
            <div>
              <div className="font-inter text-[#1A1008] text-[15px] lg:text-[17px] font-bold tracking-tight">
                12,500+
              </div>
              <div className="text-[#5A4030] text-[9px] tracking-wider uppercase font-medium">
                {t('hero.stat1')}
              </div>
            </div>

            <div className="h-6 w-[1px] bg-[#D8C6A8]/60" />

            <div>
              <div className="font-inter text-[#1A1008] text-[15px] lg:text-[17px] font-bold tracking-tight">
                99.2%
              </div>
              <div className="text-[#5A4030] text-[9px] tracking-wider uppercase font-medium">
                {t('hero.stat2')}
              </div>
            </div>

            <div className="h-6 w-[1px] bg-[#D8C6A8]/60" />

            <div>
              <div className="font-inter text-[#1A1008] text-[15px] lg:text-[17px] font-bold tracking-tight flex items-center gap-0.5">
                <PackageCheck className="w-3.5 h-3.5 text-[#8E6E2F]" />
                <span>100%</span>
              </div>
              <div className="text-[#5A4030] text-[9px] tracking-wider uppercase font-medium">
                {t('hero.stat3')}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PC-ONLY 3-SECOND PROMO POPUP CARD (On right silk space)     */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex items-center justify-end z-20 self-center">
          <HeroPackageShowcase
            packages={packages}
            onSelectPackage={onViewPackageDetail}
            onExplorePackages={onExplorePackages}
          />
        </div>
      </div>

      {/* Hero Bottom Bar — desktop only, sits above the fade overlay */}
      <div className="hidden lg:flex w-full px-5 sm:px-8 lg:px-14 py-2 z-10 items-center justify-between text-[8px] sm:text-[9px] text-[#756457]/60 font-inter tracking-widest uppercase">
        <div>© MBM GIFTS</div>
        <div>LUXURY COLLECTION</div>
      </div>
    </section>
  );
};
