import React from 'react';
import { ArrowUpRight, Award, Crown, Sparkles, PackageCheck, Globe, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMarket } from '../context/MarketContext';

interface HeroProps {
  onExplorePackages: () => void;
  onOpenCustomizer?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplorePackages }) => {
  const { t } = useLanguage();
  const { buyerMarket } = useMarket();

  return (
    <section className="relative min-h-[calc(100vh-76px)] w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Dark Red Base Background */}
      <div className="absolute inset-0 bg-[#8c1119] -z-30" />

      {/* Hero Header Image Overlay */}
      <div className="absolute inset-0 -z-28 opacity-25 mix-blend-luminosity overflow-hidden">
        <img
          src="/header_hero.jpg"
          alt="Luxury Gift Collection Header"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter contrast-125 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#8c1119] via-[#8c1119]/80 to-[#380509]/90" />
      </div>

      {/* Darkened Corners / Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_#380509_100%)] -z-25 pointer-events-none" />

      {/* White Light Spotlight */}
      <div className="animate-fade-in-delay absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(255,255,255,0.45)_0%,_rgba(255,255,255,0.2)_30%,_rgba(255,255,255,0.05)_55%,_transparent_75%)] -z-20 pointer-events-none" />

      {/* Right side Gift Reveal Animation - Hidden on small screens, visible on larger */}
      <div className="hidden lg:flex absolute right-16 xl:right-40 top-[50%] -translate-y-1/2 z-10 flex-col items-end pointer-events-none w-[400px] xl:w-[460px] opacity-100">
        {/* Gift Reveal Animation Widget */}
        <div className="w-full h-[460px] xl:h-[520px]">
          <iframe
            src="/gift-reveal-widget.html"
            title="Gift Reveal Animation"
            className="w-full h-full border-0 bg-transparent overflow-hidden"
            style={{ background: 'transparent' }}
          />
        </div>
      </div>

      {/* Main Hero Body */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 flex-1 flex flex-col justify-center z-10 py-8 sm:py-10 lg:py-12">
        <div className="max-w-full lg:max-w-2xl xl:max-w-3xl">
          {/* Market-aware Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full">
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-300" />
              <span>{t('hero.badge')}</span>
            </div>

            {buyerMarket === 'INTERNATIONAL' && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full animate-fade-in">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pay USD • Free Delivery in Ethiopia</span>
              </div>
            )}
          </div>

          {/* Main Heading */}
          <h1 className="animate-fade-up-delay-1 font-inter font-black text-white uppercase tracking-tight text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] xl:text-[4rem] leading-[1.05] drop-shadow-lg mt-2">
            <span className="block text-amber-300">BESPOKE GIFTS</span>
            <span className="block text-white mt-1">FOR EVERY</span>
            <span className="block text-white">MILESTONE</span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up-delay-2 mt-4 sm:mt-6 lg:mt-8 text-white/80 text-xs sm:text-sm md:text-base font-inter leading-relaxed max-w-full sm:max-w-md">
            {buyerMarket === 'INTERNATIONAL'
              ? 'Ordering from abroad? Send luxury gift packages directly to loved ones, partners, and family in Ethiopia with complimentary hand-delivery.'
              : t('hero.subtitle')}
          </p>

          {/* CTA Row */}
          <div className="animate-fade-up-delay-3 mt-6 sm:mt-8 lg:mt-10 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
            <button
              onClick={onExplorePackages}
              className="group bg-amber-400 hover:bg-amber-300 text-[#8c1119] px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-[10px] sm:text-[11px] md:text-xs tracking-widest uppercase flex items-center gap-2 font-inter font-bold transition-all duration-300 cursor-pointer rounded-full shadow-lg shadow-amber-400/20"
            >
              <span>{t('hero.exploreBtn')}</span>
              <ArrowUpRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <div className="hidden md:flex items-center gap-3 border-l border-white/15 pl-4 sm:pl-6">
              <Award className="w-7 sm:w-8 h-7 sm:h-8 text-amber-300 flex-shrink-0" />
              <div className="text-white/70 text-[10px] sm:text-xs tracking-wider uppercase font-inter leading-tight">
                <div>Top-Rated</div>
                <div>Gift Studio</div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="animate-fade-up-delay-4 mt-6 sm:mt-8 md:mt-10 lg:mt-14 flex flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16">
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
      </div>

      {/* Hero Bottom Bar */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-2.5 sm:py-3 lg:py-5 z-10 flex items-center justify-between text-[8px] sm:text-[9px] md:text-[10px] text-white/40 font-inter tracking-widest uppercase border-t border-white/10">
        <div>© MBM GIFTS</div>
        <div className="hidden sm:block">LUXURY COLLECTION</div>
      </div>
    </section>
  );
};

