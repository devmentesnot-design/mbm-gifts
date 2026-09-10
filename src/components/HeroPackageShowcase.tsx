import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { PreparedPackage } from '../data/giftsData';

interface HeroPackageShowcaseProps {
  packages?: PreparedPackage[];
  onSelectPackage?: (pkgId: string) => void;
  onExplorePackages?: () => void;
}

// Real ready-made package visuals from database
const FALLBACK_SHOWCASE_PACKAGES = [
  {
    id: 'pkg-1788923362117',
    name: 'New Year Package',
    badge: 'LUXURY EDITION',
    image: 'https://res.cloudinary.com/dhdkyidvp/image/upload/v1788930293/x2hsu9pvmjry0zspwdc0.png',
    priceText: '33,500 ETB / $300',
  },
  {
    id: 'pkg-1788927041850',
    name: 'New Year Feast Gift Package',
    badge: 'HOLIDAY SPECIAL',
    image: 'https://res.cloudinary.com/dhdkyidvp/image/upload/v1788926930/qtjsq0ecdrzwshh51hb9.png',
    priceText: '8,800 ETB / $100',
  }
];

export const HeroPackageShowcase: React.FC<HeroPackageShowcaseProps> = ({
  packages = [],
  onSelectPackage,
  onExplorePackages,
}) => {
  // Use live ready-made packages from Supabase, or real fallback packages if loading
  const displayPackages = React.useMemo(() => {
    const validLive = (packages || []).filter((p) => p && p.image && p.image.trim() !== '');
    if (validLive.length > 0) {
      return validLive.map((p) => ({
        id: p.id,
        name: p.name,
        badge: p.badge || 'READY-MADE PACKAGE',
        image: p.image,
        priceText: p.price ? `${p.price.toLocaleString()} ETB` : 'Ready-Made Package',
      }));
    }

    return FALLBACK_SHOWCASE_PACKAGES;
  }, [packages]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload all package images for ultra-smooth transitions without any white flicker
  useEffect(() => {
    displayPackages.forEach((pkg) => {
      if (pkg.image) {
        const img = new Image();
        img.src = pkg.image;
      }
    });
  }, [displayPackages]);

  // Automatic 3-second transition cycle
  useEffect(() => {
    if (displayPackages.length <= 1) return;

    const interval = setInterval(() => {
      // Step 1: Start fade out and scale down transition
      setIsTransitioning(true);

      // Step 2: Swap the package at midpoint of transition
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % displayPackages.length);
        // Step 3: Fade in and scale up the new package
        setTimeout(() => {
          setIsTransitioning(false);
        }, 80);
      }, 450);
    }, 3000);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [displayPackages.length]);

  const currentPkg = displayPackages[currentIndex] || displayPackages[0];

  const handleClick = () => {
    if (onSelectPackage && currentPkg.id) {
      onSelectPackage(currentPkg.id);
    } else if (onExplorePackages) {
      onExplorePackages();
    }
  };

  return (
    <div
      className="relative w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[460px] xl:max-w-[540px] aspect-[4/4.5] sm:aspect-[4/4.2] flex flex-col items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ========================================================================= */}
      {/* LAYER 1: GOLDEN BACKGROUND GLOW (Static Ambient Illumination)             */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
        {/* Central soft golden core glow */}
        <div className="w-[300px] sm:w-[380px] xl:w-[440px] h-[300px] sm:h-[380px] xl:h-[440px] rounded-full bg-[radial-gradient(circle,_rgba(245,197,66,0.22)_0%,_rgba(217,165,20,0.12)_40%,_rgba(43,0,5,0)_70%)] blur-2xl animate-luxury-glow" />

        {/* Secondary warm gold spotlight reflection */}
        <div className="absolute top-[25%] w-[240px] sm:w-[300px] h-[240px] sm:h-[300px] rounded-full bg-[radial-gradient(circle,_rgba(255,220,120,0.16)_0%,_rgba(217,165,20,0.06)_50%,_transparent_75%)] blur-xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 2: GOLDEN RIBBON / LIGHT TRAILS (Flowing Cinematic Curves)          */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-visible flex items-center justify-center">
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full animate-luxury-ribbon opacity-70 drop-shadow-[0_0_12px_rgba(245,197,66,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldRibbonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5C542" stopOpacity="0.1" />
              <stop offset="30%" stopColor="#FFF2B2" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#D9A514" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#8F0712" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="goldRibbonGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5C542" stopOpacity="0" />
              <stop offset="40%" stopColor="#F5C542" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#FFE082" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2B0005" stopOpacity="0.05" />
            </linearGradient>
            <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Flowing curve 1: sweeps gracefully behind & under */}
          <path
            d="M 50 340 C 140 390, 360 400, 450 330 C 490 300, 440 240, 380 260 C 310 280, 240 230, 290 170 C 340 120, 430 160, 460 210"
            stroke="url(#goldRibbonGrad1)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
            className="opacity-80"
          />

          {/* Flowing curve 2: subtle companion arc */}
          <path
            d="M 70 180 C 120 120, 210 130, 260 175 C 320 230, 230 330, 150 340 C 80 350, 40 290, 80 230"
            stroke="url(#goldRibbonGrad2)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
            className="opacity-60"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 3: FLOATING GOLDEN PARTICLES / SPARKLES (8–14 Subtle Elements)       */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Sparkle 1 */}
        <div
          className="absolute top-[18%] left-[16%] w-1.5 h-1.5 rounded-full bg-[#FFF2B2] shadow-[0_0_8px_#F5C542]"
          style={{ animation: 'luxury-particle-float 4.2s ease-in-out infinite', animationDelay: '0s' }}
        />
        {/* Sparkle 2 */}
        <div
          className="absolute top-[28%] right-[18%] w-2 h-2 rounded-full bg-[#F5C542] shadow-[0_0_10px_#F5C542]"
          style={{ animation: 'luxury-particle-float 4.8s ease-in-out infinite', animationDelay: '1.2s' }}
        />
        {/* Sparkle 3 */}
        <div
          className="absolute top-[48%] left-[10%] w-1 h-1 rounded-full bg-[#FFE082] shadow-[0_0_6px_#FFE082]"
          style={{ animation: 'luxury-particle-float 3.8s ease-in-out infinite', animationDelay: '2.1s' }}
        />
        {/* Sparkle 4 */}
        <div
          className="absolute top-[62%] right-[14%] w-1.5 h-1.5 rounded-full bg-[#FFF8ED] shadow-[0_0_8px_#F5C542]"
          style={{ animation: 'luxury-particle-float 4.5s ease-in-out infinite', animationDelay: '0.8s' }}
        />
        {/* Sparkle 5 */}
        <div
          className="absolute top-[38%] right-[28%] w-1 h-1 rounded-full bg-[#F5C542] shadow-[0_0_6px_#D9A514]"
          style={{ animation: 'luxury-particle-float 5.2s ease-in-out infinite', animationDelay: '2.7s' }}
        />
        {/* Sparkle 6 */}
        <div
          className="absolute top-[14%] right-[32%] w-2 h-2 rounded-full bg-[#FFF2B2] shadow-[0_0_10px_#F5C542]"
          style={{ animation: 'luxury-particle-float 4.0s ease-in-out infinite', animationDelay: '1.9s' }}
        />
        {/* Sparkle 7 */}
        <div
          className="absolute top-[72%] left-[22%] w-1.5 h-1.5 rounded-full bg-[#F5C542] shadow-[0_0_8px_#F5C542]"
          style={{ animation: 'luxury-particle-float 4.6s ease-in-out infinite', animationDelay: '3.1s' }}
        />
        {/* Sparkle 8 */}
        <div
          className="absolute top-[52%] right-[8%] w-1 h-1 rounded-full bg-[#FFE082] shadow-[0_0_6px_#FFE082]"
          style={{ animation: 'luxury-particle-float 3.6s ease-in-out infinite', animationDelay: '0.4s' }}
        />
        {/* Sparkle 9 */}
        <div
          className="absolute top-[22%] left-[34%] w-1.5 h-1.5 rounded-full bg-[#FFF8ED] shadow-[0_0_8px_#F5C542]"
          style={{ animation: 'luxury-particle-float 4.9s ease-in-out infinite', animationDelay: '1.5s' }}
        />
        {/* Sparkle 10 */}
        <div
          className="absolute top-[66%] right-[30%] w-1 h-1 rounded-full bg-[#F5C542] shadow-[0_0_6px_#F5C542]"
          style={{ animation: 'luxury-particle-float 4.1s ease-in-out infinite', animationDelay: '2.4s' }}
        />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 4: FLOATING READY-MADE PACKAGE (Changes every 3 seconds)            */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center cursor-pointer pt-2 pb-10" onClick={handleClick}>
        {/* Continuous Smooth Floating Container */}
        <div className="animate-luxury-float w-full flex flex-col items-center justify-center transition-transform duration-300 group">
          {/* Main Package Image with Transition Effects */}
          <div className="relative flex items-center justify-center w-[270px] sm:w-[320px] md:w-[350px] lg:w-[360px] xl:w-[410px] h-[260px] sm:h-[300px] md:h-[330px] lg:h-[340px] xl:h-[380px]">
            {/* Subtle transition shimmer flash */}
            <div
              className={`absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(255,242,178,0.45)_0%,_rgba(245,197,66,0.2)_40%,_transparent_70%)] blur-lg pointer-events-none transition-opacity duration-300 ${
                isTransitioning ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
              }`}
            />

            {/* Ready-Made Package Image */}
            <img
              key={currentPkg.id || currentIndex}
              src={currentPkg.image}
              alt={currentPkg.name || 'MBM Luxury Ready-Made Gift Package'}
              className={`w-full h-full object-contain filter drop-shadow-[0_18px_26px_rgba(0,0,0,0.85)] drop-shadow-[0_0_24px_rgba(245,197,66,0.22)] transition-all duration-500 ease-out transform ${
                isTransitioning
                  ? 'opacity-0 scale-90 -translate-y-2 blur-[1px]'
                  : 'opacity-100 scale-100 translate-y-0 blur-0'
              } group-hover:scale-105`}
              loading="eager"
            />
          </div>

          {/* Package Info Tag (Clean Luxury Pill Underneath Floating Package) */}
          <div
            className={`mt-1 sm:mt-2 flex flex-col items-center text-center transition-all duration-500 transform ${
              isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 bg-[#2B0005]/85 border border-[#D9A514]/40 backdrop-blur-md px-3 sm:px-4 py-1 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              <Sparkles className="w-3 h-3 text-[#F5C542] animate-pulse" />
              <span className="text-[9px] sm:text-[10px] md:text-xs font-inter font-bold tracking-widest text-[#FFF8ED] uppercase">
                {currentPkg.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 5: FIXED LUXURY STAND / DISPLAY PEDESTAL (Fixed Base Plinth)        */}
      {/* ========================================================================= */}
      <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 w-full flex flex-col items-center pointer-events-none z-10">
        {/* 1. Ambient Under-Pedestal Floor Glow */}
        <div className="absolute -bottom-5 w-[320px] sm:w-[390px] md:w-[440px] xl:w-[480px] h-[45px] sm:h-[60px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(245,197,66,0.4)_0%,_rgba(217,165,20,0.18)_45%,_rgba(43,0,5,0)_75%)] blur-md -z-10" />

        {/* 2. Pedestal Structure Container */}
        <div className="relative w-[280px] sm:w-[340px] md:w-[380px] xl:w-[430px] flex flex-col items-center">
          {/* Top Disc (Metallic Burgundy Disc with Thin Gold Illuminated Rim) */}
          <div className="relative w-full h-[48px] sm:h-[58px] md:h-[68px] rounded-[100%] border-[1.5px] border-[#F5C542]/85 shadow-[0_0_18px_rgba(245,197,66,0.5),inset_0_0_15px_rgba(245,197,66,0.3)] bg-gradient-to-b from-[#3a0309] via-[#1a0103] to-[#0d0002] overflow-hidden flex items-center justify-center">
            {/* Top Surface Specular Light Arc */}
            <div className="absolute inset-0 rounded-[100%] bg-[radial-gradient(ellipse_70%_50%_at_50%_25%,_rgba(255,242,178,0.35)_0%,_rgba(217,165,20,0.12)_45%,_transparent_75%)] pointer-events-none" />

            {/* Inner Golden Rim Line */}
            <div className="absolute inset-[3px] sm:inset-[4px] rounded-[100%] border border-[#D9A514]/40 pointer-events-none" />

            {/* Dynamic Package Contact Shadow on Top of Stand (Breathes with Float) */}
            <div className="animate-luxury-shadow w-[60%] h-[55%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.95)_0%,_rgba(15,0,3,0.7)_50%,_transparent_80%)] blur-[3px]" />
          </div>

          {/* Pedestal Side Plinth / Cylinder Depth */}
          <div className="relative -mt-[24px] sm:-mt-[29px] md:-mt-[34px] w-full h-[18px] sm:h-[22px] md:h-[26px] bg-gradient-to-b from-[#180104] via-[#0e0002] to-[#050001] border-x border-[#D9A514]/40 border-b-[1.5px] border-b-[#F5C542]/75 rounded-b-[100%] shadow-[0_12px_24px_rgba(0,0,0,0.85)] flex items-end justify-center">
            {/* Bottom Plinth Golden Edge Sheen */}
            <div className="w-[85%] h-[1px] bg-gradient-to-r from-transparent via-[#F5C542]/80 to-transparent mb-[2px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
