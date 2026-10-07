import React, { useState, useEffect } from 'react';
import { PreparedPackage } from '../data/giftsData';

interface HeroPackageShowcaseProps {
  packages?: PreparedPackage[];
  onSelectPackage?: (pkgId: string) => void;
  onExplorePackages?: () => void;
}

const CALLIGRAPHY_PROMPTS = [
  {
    lines: ['Because', 'she deserves', 'the best'],
    symbol: '♡',
    underlineWidth: 140,
  },
  {
    lines: ['Unwrap', 'Pure Magic &', 'Luxury'],
    symbol: '✨',
    underlineWidth: 130,
  },
  {
    lines: ['Made with Love,', 'Given with', 'Pure Joy'],
    symbol: '♡',
    underlineWidth: 150,
  },
  {
    lines: ['Every Milestone', 'Deserves a', 'Special Gift'],
    symbol: '🎁',
    underlineWidth: 155,
  },
  {
    lines: ['Delivered with', 'Bespoke Care &', 'Elegance'],
    symbol: '♡',
    underlineWidth: 145,
  },
  {
    lines: ['Create', 'Unforgettable', 'Memories'],
    symbol: '✨',
    underlineWidth: 140,
  },
];

export const HeroPackageShowcase: React.FC<HeroPackageShowcaseProps> = ({
  onExplorePackages,
}) => {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % CALLIGRAPHY_PROMPTS.length);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = CALLIGRAPHY_PROMPTS[index];

  return (
    <div
      className="cursor-pointer select-none pr-4 lg:pr-8 xl:pr-14 min-w-[190px] xl:min-w-[230px]"
      onClick={onExplorePackages}
    >
      <div className="relative transform -rotate-8 hover:-rotate-4 transition-transform duration-500">
        <div
          className={`transition-all duration-350 ease-out transform ${
            isTransitioning
              ? 'opacity-0 translate-y-2 scale-95'
              : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          <p
            className="font-natalie text-[#342012] text-[24px] lg:text-[28px] xl:text-[34px] leading-[1.28] tracking-normal text-left select-none"
            style={{
              textShadow:
                '0 1px 2px rgba(255, 255, 255, 0.95), 0 2px 8px rgba(255, 255, 255, 0.8), 0 0 14px rgba(247, 241, 231, 0.85)',
            }}
          >
            {current.lines.map((line, i) => (
              <React.Fragment key={i}>
                <span className="inline-block">{line}</span>
                {i === current.lines.length - 1 ? (
                  <span className="inline-block ml-1.5 text-xl lg:text-[24px] xl:text-[28px] text-[#4A2D1B]">
                    {current.symbol}
                  </span>
                ) : (
                  <br />
                )}
              </React.Fragment>
            ))}
          </p>

          {/* Clean, natural underline */}
          <svg
            className="h-3 mt-1 overflow-visible text-[#342012]/90"
            style={{ width: `${current.underlineWidth}px` }}
            viewBox="0 0 150 10"
            fill="none"
          >
            <path
              d="M3 6 C 45 10, 105 3, 147 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
