import React from 'react';
import { Gift, PenTool, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProcessSectionProps {
  onExplore?: () => void;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({ onExplore }) => {
  const steps = [
    {
      step: '01',
      title: 'Curate or Build',
      subtitle: 'Select from master-crafted packages or handpick bespoke items in our studio builder.',
      icon: Gift,
      badge: 'Step 01 • Selection',
      image: '/header_hero.jpg',
      features: ['Curated gift themes', 'Custom item-by-item builder', 'Real-time price preview'],
    },
    {
      step: '02',
      title: 'Wax-Sealed Note',
      subtitle: 'Compose your heartfelt message hand-transcribed on heavy parchment and sealed with crimson wax.',
      icon: PenTool,
      badge: 'Step 02 • Personalization',
      image: '/about us page.jpg',
      features: ['Handwritten calligraphy', 'Authentic royal wax seal', 'Luxury ribbon wrap'],
    },
    {
      step: '03',
      title: 'White-Glove Delivery',
      subtitle: 'Dispatched with care, hand-delivered directly to the recipient door with live status updates.',
      icon: Truck,
      badge: 'Step 03 • Fulfillment',
      image: '/login img.png',
      features: ['Tracked doorstep delivery', 'No invoices inside box', '100% delight guarantee'],
    },
  ];

  return (
    <section id="process" className="relative w-full px-4 sm:px-8 lg:px-16 py-16 sm:py-24 lg:py-28 overflow-hidden select-none">
      {/* Subtle ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#D9A514]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-[#D9A514]/15 border border-[#D9A514]/30 text-[#F5C542] text-xs font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
            <span>The Gifting Experience</span>
          </div>

          <h2 className="font-podium text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#FFF8ED] leading-tight">
            How It Works
          </h2>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#D9A514]/60" />
            <div className="w-2 h-2 rotate-45 border border-[#D9A514] bg-[#F5C542]" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#D9A514]/60" />
          </div>

          <p className="text-[#FFF8ED]/80 text-sm sm:text-base font-inter leading-relaxed max-w-xl mx-auto mt-4">
            Three seamless steps from your heart to their hands — designed to create unforgettable luxury unboxing memories.
          </p>
        </div>

        {/* 3 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="luxury-satin-card luxury-satin-card-hover rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Decorative Top Gold Edge */}
                <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#D9A514]/40 to-transparent group-hover:via-[#F5C542]/80 transition-all" />

                <div>
                  {/* Top Step Row */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#F5C542] uppercase tracking-widest bg-[#D9A514]/15 border border-[#D9A514]/30 px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                    <span className="font-podium text-3xl sm:text-4xl font-black text-[#D9A514]/40 group-hover:text-[#F5C542] transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* Card Visual / Thumbnail */}
                  <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-6 bg-black/40 border border-white/10 group-hover:border-[#D9A514]/30 transition-all">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#230005]/90 via-[#230005]/20 to-transparent" />
                    
                    <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-[#230005]/90 border border-[#D9A514]/40 text-[#F5C542] flex items-center justify-center backdrop-blur-sm shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-podium text-xl sm:text-2xl font-bold uppercase text-[#FFF8ED] mb-3 group-hover:text-[#F5C542] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-[#FFF8ED]/75 text-xs sm:text-sm font-inter leading-relaxed mb-6">
                    {item.subtitle}
                  </p>
                </div>

                {/* Features List */}
                <div className="pt-5 border-t border-white/10 space-y-2.5">
                  {item.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#FFF8ED]/85 font-inter">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F5C542] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
