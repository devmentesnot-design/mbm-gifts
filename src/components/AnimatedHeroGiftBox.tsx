import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const AnimatedHeroGiftBox: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);

  // Individual Product Refs
  const champagneRef = useRef<HTMLDivElement>(null);
  const wineRef = useRef<HTMLDivElement>(null);
  const chocolateRef = useRef<HTMLDivElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const giftBagRef = useRef<HTMLDivElement>(null);
  const glassesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ----------------------------------------------------
    // GSAP TIMELINE INITIALIZATION
    // ----------------------------------------------------
    const items = [
      { ref: champagneRef.current, name: 'Champagne Bottle', rotate: 4 },
      { ref: wineRef.current, name: 'Wine Bottle', rotate: -4 },
      { ref: chocolateRef.current, name: 'Chocolate Box', rotate: 3 },
      { ref: candleRef.current, name: 'Scented Candle', rotate: -3 },
      { ref: giftBagRef.current, name: 'Gift Bag', rotate: 4 },
      { ref: glassesRef.current, name: 'Crystal Glasses', rotate: -3 },
    ];

    // Master Timeline with 1s initial delay, infinite loop, and 2s pause between cycles
    const tl = gsap.timeline({
      delay: 1,
      repeat: -1,
      repeatDelay: 2,
      paused: false,
    });

    // 1. Open Gift Box Lid Slightly
    tl.to(lidRef.current, {
      y: -30,
      rotate: -5,
      duration: 0.6,
      ease: 'power3.inOut',
    });

    // 2. Animate each product coming out one at a time, floating, then returning
    items.forEach((item) => {
      if (!item.ref) return;

      // Step A: Product rises from inside the box (120-180px) & rotates 3-5 deg
      tl.to(item.ref, {
        y: -160,
        rotate: item.rotate,
        scale: 1.05,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.inOut',
      });

      // Step B: Product gently floats for 1.5 seconds
      tl.to(item.ref, {
        y: -175,
        rotate: item.rotate * -0.5,
        duration: 1.5,
        ease: 'sine.inOut',
      });

      // Step C: Product returns smoothly back into the box
      tl.to(item.ref, {
        y: 0,
        rotate: 0,
        scale: 0.8,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.inOut',
      });
    });

    // 3. Close the Gift Box Lid after all items finish
    tl.to(lidRef.current, {
      y: 0,
      rotate: 0,
      duration: 0.6,
      ease: 'power3.inOut',
    });

    // ----------------------------------------------------
    // INACTIVE TAB PAUSE / RESUME HANDLER
    // ----------------------------------------------------
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tl.pause();
      } else {
        tl.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup timeline & event listener on unmount
    return () => {
      tl.kill();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[440px] lg:max-w-[500px] aspect-[4/5] flex items-end justify-center pointer-events-none select-none"
    >
      {/* Soft Glow Under Box */}
      <div className="absolute bottom-4 w-72 h-16 bg-amber-400/20 rounded-full blur-2xl -z-10" />

      {/* ---------------------------------------------------- */}
      {/* ANIMATED PRODUCT LAYERS (Positon behind front panel) */}
      {/* ---------------------------------------------------- */}

      {/* 1. Champagne Bottle */}
      <div
        ref={champagneRef}
        className="absolute bottom-28 z-10 opacity-0 transform-gpu flex flex-col items-center"
      >
        <div className="relative group drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
          <svg className="w-24 h-52 sm:w-28 sm:h-60" viewBox="0 0 100 220" fill="none">
            {/* Bottle Body */}
            <path d="M35 80 L35 195 Q35 205 45 205 L55 205 Q65 205 65 195 L65 80 Q65 60 55 40 L55 15 L45 15 L45 40 Q35 60 35 80 Z" fill="#1b4d2e" stroke="#d4af37" strokeWidth="2" />
            {/* Gold Foil Neck */}
            <path d="M44 15 L56 15 L56 45 L44 45 Z" fill="#e5c158" />
            {/* Label */}
            <rect x="38" y="100" width="24" height="45" rx="3" fill="#faf6ee" stroke="#d4af37" strokeWidth="1" />
            <text x="50" y="125" textAnchor="middle" fill="#8c1119" fontSize="7" fontWeight="bold" fontFamily="sans-serif">MBM</text>
            <text x="50" y="135" textAnchor="middle" fill="#1b4d2e" fontSize="5" fontFamily="sans-serif">RESERVE</text>
          </svg>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-400/40 tracking-widest uppercase whitespace-nowrap">
            Champagne Reserve
          </span>
        </div>
      </div>

      {/* 2. Wine Bottle */}
      <div
        ref={wineRef}
        className="absolute bottom-28 z-10 opacity-0 transform-gpu flex flex-col items-center"
      >
        <div className="relative drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
          <svg className="w-24 h-52 sm:w-28 sm:h-60" viewBox="0 0 100 220" fill="none">
            <path d="M36 85 L36 195 Q36 205 45 205 L55 205 Q64 205 64 195 L64 85 Q64 65 54 45 L54 18 L46 18 L46 45 Q36 65 36 85 Z" fill="#4a070c" stroke="#e5c158" strokeWidth="1.5" />
            <path d="M45 18 L55 18 L55 40 L45 40 Z" fill="#8c1119" stroke="#e5c158" strokeWidth="1" />
            <rect x="39" y="105" width="22" height="50" rx="2" fill="#111" stroke="#e5c158" strokeWidth="1" />
            <text x="50" y="130" textAnchor="middle" fill="#e5c158" fontSize="6" fontWeight="bold">VINTAGE</text>
          </svg>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-400/40 tracking-widest uppercase whitespace-nowrap">
            Vintage Bordeaux
          </span>
        </div>
      </div>

      {/* 3. Luxury Chocolates */}
      <div
        ref={chocolateRef}
        className="absolute bottom-28 z-10 opacity-0 transform-gpu flex flex-col items-center"
      >
        <div className="relative drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
          <svg className="w-32 h-32 sm:w-36 sm:h-36" viewBox="0 0 120 120" fill="none">
            <rect x="15" y="25" width="90" height="70" rx="8" fill="#2b1704" stroke="#e5c158" strokeWidth="2" />
            <rect x="20" y="30" width="80" height="60" rx="5" fill="#3d230a" />
            {/* Truffles grid */}
            <circle cx="40" cy="50" r="8" fill="#d4af37" />
            <circle cx="60" cy="50" r="8" fill="#6e0d13" />
            <circle cx="80" cy="50" r="8" fill="#d4af37" />
            <circle cx="40" cy="70" r="8" fill="#6e0d13" />
            <circle cx="60" cy="70" r="8" fill="#d4af37" />
            <circle cx="80" cy="70" r="8" fill="#6e0d13" />
          </svg>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-400/40 tracking-widest uppercase whitespace-nowrap">
            Swiss Truffles
          </span>
        </div>
      </div>

      {/* 4. Scented Candle */}
      <div
        ref={candleRef}
        className="absolute bottom-28 z-10 opacity-0 transform-gpu flex flex-col items-center"
      >
        <div className="relative drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
          <svg className="w-28 h-36 sm:w-32 sm:h-40" viewBox="0 0 100 130" fill="none">
            {/* Flame */}
            <path d="M50 10 Q55 25 50 35 Q45 25 50 10 Z" fill="#ffb703" className="animate-pulse" />
            {/* Candle Body */}
            <rect x="25" y="35" width="50" height="75" rx="6" fill="#8c1119" stroke="#e5c158" strokeWidth="2" />
            <rect x="30" y="40" width="40" height="65" rx="4" fill="#6e0d13" />
            <text x="50" y="75" textAnchor="middle" fill="#e5c158" fontSize="7" fontWeight="bold">VELVET ROSE</text>
          </svg>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-400/40 tracking-widest uppercase whitespace-nowrap">
            Velvet Soy Candle
          </span>
        </div>
      </div>

      {/* 5. Luxury Gift Bag */}
      <div
        ref={giftBagRef}
        className="absolute bottom-28 z-10 opacity-0 transform-gpu flex flex-col items-center"
      >
        <div className="relative drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
          <svg className="w-32 h-40 sm:w-36 sm:h-44" viewBox="0 0 120 140" fill="none">
            {/* Handles */}
            <path d="M45 40 Q45 15 60 15 Q75 15 75 40" fill="none" stroke="#e5c158" strokeWidth="3" />
            {/* Bag */}
            <path d="M20 40 L100 40 L108 125 L12 125 Z" fill="#000" stroke="#e5c158" strokeWidth="2" />
            <text x="60" y="85" textAnchor="middle" fill="#e5c158" fontSize="10" fontWeight="bold">MBM</text>
          </svg>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-400/40 tracking-widest uppercase whitespace-nowrap">
            MBM Boutique Bag
          </span>
        </div>
      </div>

      {/* 6. Crystal Glasses */}
      <div
        ref={glassesRef}
        className="absolute bottom-28 z-10 opacity-0 transform-gpu flex flex-col items-center"
      >
        <div className="relative drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
          <svg className="w-32 h-40 sm:w-36 sm:h-44" viewBox="0 0 120 140" fill="none">
            {/* Glass 1 */}
            <path d="M30 30 L45 70 L45 110 L30 110 L60 110 L45 110 L45 70 L60 30 Z" fill="rgba(255,255,255,0.2)" stroke="#e5c158" strokeWidth="1.5" />
            {/* Glass 2 */}
            <path d="M60 30 L75 70 L75 110 L60 110 L90 110 L75 110 L75 70 L90 30 Z" fill="rgba(255,255,255,0.2)" stroke="#e5c158" strokeWidth="1.5" />
          </svg>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-400/40 tracking-widest uppercase whitespace-nowrap">
            Crystal Flutes
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* GIFT BOX STRUCTURE (Lid & Base Front Panel) */}
      {/* ---------------------------------------------------- */}
      <div className="relative w-full flex flex-col items-center z-20">
        {/* Animated Box Lid */}
        <div
          ref={lidRef}
          className="relative w-72 sm:w-80 h-16 sm:h-20 bg-gradient-to-r from-[#8c1119] via-[#bd1722] to-[#8c1119] border-2 border-amber-400/80 rounded-t-md shadow-xl flex items-center justify-center transform-gpu"
        >
          {/* Gold Lid Ribbon Accent */}
          <div className="w-10 h-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-md flex items-center justify-center">
            {/* Ribbon Bow */}
            <div className="w-12 h-6 bg-amber-400 rounded-full border border-amber-200 -mt-6 shadow-md" />
          </div>
        </div>

        {/* Box Base Front Panel */}
        <div className="relative w-68 sm:w-76 h-48 sm:h-56 bg-gradient-to-b from-[#6e0d13] via-[#8c1119] to-[#380509] border-2 border-t-0 border-amber-400/80 rounded-b-md shadow-2xl flex flex-col items-center justify-center overflow-hidden">
          {/* Vertical Ribbon */}
          <div className="absolute inset-y-0 w-10 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-lg" />
          
          {/* MBM Gold Seal Emblem */}
          <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-100 border-2 border-amber-200 shadow-xl flex flex-col items-center justify-center text-[#8c1119] font-podium font-bold text-xs uppercase tracking-wider">
            <span>MBM</span>
            <span className="text-[7px] tracking-widest font-inter">GIFTS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
