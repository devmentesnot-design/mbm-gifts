import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartItem } from '../types/cart';
import {
  Sparkles,
  Heart,
  Award,
  ShieldCheck,
  Gift,
  ArrowRight,
  CheckCircle2,
  Users,
  Feather,
  Package,
  Smile,
  Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutUsPageProps {
  session: any;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onNavigateToLogin: () => void;
  onNavigate: (path: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  session,
  cartItems,
  onOpenCart,
  onNavigateToLogin,
  onNavigate,
}) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-[#3a060a] text-white font-inter selection:bg-amber-400 selection:text-[#8c1119] flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        session={session}
        cartItems={cartItems}
        onOpenCart={onOpenCart}
        onNavigateToLogin={onNavigateToLogin}
        onNavigate={onNavigate}
      />

      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="relative pt-12 pb-20 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#8c1119] via-[#5c0910] to-[#3a060a] overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('about.badge') || 'Artisanal Luxury Studio'}</span>
            </div>

            <h1 className="font-podium text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white mb-6 leading-tight">
              Crafting Unforgettable Moments & Luxury Gifts
            </h1>

            <p className="text-white/85 text-base sm:text-lg max-w-3xl mx-auto font-inter leading-relaxed mb-8">
              At MBM Gifts, we believe every present should tell a story. Handcrafted with passion, our luxury gift hampers combine elegance, premium artisan treats, and personalized calligraphy touches sealed with wax.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('/')}
                className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Explore Gift Collections</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/how-to-order')}
                className="bg-black/40 hover:bg-black/60 text-amber-300 border border-amber-400/40 hover:border-amber-400 font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                <span>How To Order Guide</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 1: Our Story & Founding Legacy */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 border-t border-white/10 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Image Column */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl group bg-black/40">
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop"
                    alt="Artisanal gift box packing"
                    className="w-full h-80 sm:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-white/15 rounded-2xl">
                    <p className="font-podium text-sm uppercase font-bold text-amber-300 mb-1">
                      Est. 2024 — Addis Ababa & Beyond
                    </p>
                    <p className="text-white/80 text-xs font-inter leading-relaxed">
                      Every ribbon, wax seal, and item placement is executed by hand in our studio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Column */}
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
                  <Heart className="w-4 h-4 text-amber-400" />
                  <span>The MBM Vision</span>
                </div>
                <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-white mb-6 leading-tight">
                  Redefining The Art of Gifting
                </h2>
                <div className="space-y-4 text-white/80 text-sm sm:text-base font-inter leading-relaxed">
                  <p>
                    MBM Gifts started with a simple observation: standard gift boxes were predictable, mass-produced, and lacked soul. We envisioned a luxury atelier where every gift hamper feels like a personal work of art.
                  </p>
                  <p>
                    Whether celebrating a milestone birthday, sending gratitude to corporate partners, or delighting someone special just because, we curate items that spark genuine emotion.
                  </p>
                  <p>
                    From imported Swiss milk chocolate and organic botanical candles to full-grain Italian leather notebooks and hand-blown glassware, every component is rigorously tested for quality and aesthetic harmony.
                  </p>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10 text-center">
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                    <div className="font-podium text-2xl sm:text-3xl font-extrabold text-amber-300">10k+</div>
                    <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-bold mt-1">Hampers Delivered</div>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                    <div className="font-podium text-2xl sm:text-3xl font-extrabold text-amber-300">100%</div>
                    <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-bold mt-1">Hand Crafted</div>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
                    <div className="font-podium text-2xl sm:text-3xl font-extrabold text-amber-300">4.9/5</div>
                    <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-bold mt-1">Review Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Core Pillars of Excellence */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-[#2e0508] border-t border-white/10 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3">
                <Award className="w-4 h-4" />
                <span>Our Uncompromising Standards</span>
              </div>
              <h2 className="font-podium text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-4">
                The 4 Pillars of MBM Studio
              </h2>
              <p className="text-white/75 text-sm sm:text-base font-inter leading-relaxed">
                What sets MBM Gifts apart from ordinary gift services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#4a070c]/80 border border-white/15 rounded-2xl p-6 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between shadow-xl group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h3 className="font-podium text-xl font-bold uppercase text-white mb-2 group-hover:text-amber-300 transition-colors">
                    Curated Perfection
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm font-inter leading-relaxed">
                    Items are carefully paired by color scheme, texture, fragrance, and taste to create a unified luxury experience.
                  </p>
                </div>
              </div>

              <div className="bg-[#4a070c]/80 border border-white/15 rounded-2xl p-6 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between shadow-xl group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Feather className="w-6 h-6" />
                  </div>
                  <h3 className="font-podium text-xl font-bold uppercase text-white mb-2 group-hover:text-amber-300 transition-colors">
                    Wax Sealed Cards
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm font-inter leading-relaxed">
                    Personal note calligraphy written on heavyweight parchment paper, sealed with authentic red sealing wax.
                  </p>
                </div>
              </div>

              <div className="bg-[#4a070c]/80 border border-white/15 rounded-2xl p-6 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between shadow-xl group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-podium text-xl font-bold uppercase text-white mb-2 group-hover:text-amber-300 transition-colors">
                    Premium Sourcing
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm font-inter leading-relaxed">
                    Only artisanal chocolates, organic botanical aromatherapy, and handcrafted accessories make it into our boxes.
                  </p>
                </div>
              </div>

              <div className="bg-[#4a070c]/80 border border-white/15 rounded-2xl p-6 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between shadow-xl group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="font-podium text-xl font-bold uppercase text-white mb-2 group-hover:text-amber-300 transition-colors">
                    White-Glove Shipping
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm font-inter leading-relaxed">
                    Temperature-monitored protective packaging ensuring pristine condition upon arrival at your recipient's door.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Behind The Scenes Studio Workflow */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 border-t border-white/10 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Atelier Experience</span>
              </div>
              <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-white mb-4">
                How Your Gift Box Is Built
              </h2>
              <p className="text-white/80 text-sm sm:text-base font-inter">
                From component inspection to the final satin bow wrap.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-black/30 border border-white/15 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition-all">
                <img
                  src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop"
                  alt="Inspection phase"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Step 01 — Selection</div>
                  <h3 className="font-podium text-xl uppercase font-bold text-white mb-2">Rigorous Quality Inspection</h3>
                  <p className="text-white/70 text-xs sm:text-sm font-inter leading-relaxed">
                    Every product is checked for freshness, scent integrity, and flawlessness before placement into velvet-lined boxes.
                  </p>
                </div>
              </div>

              <div className="bg-black/30 border border-white/15 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition-all">
                <img
                  src="https://images.unsplash.com/photo-1576153192396-180ecef2a715?q=80&w=800&auto=format&fit=crop"
                  alt="Calligraphy note"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Step 02 — Personalization</div>
                  <h3 className="font-podium text-xl uppercase font-bold text-white mb-2">Calligraphy & Stamp Seal</h3>
                  <p className="text-white/70 text-xs sm:text-sm font-inter leading-relaxed">
                    Your personal message is handwritten using traditional dip-pen ink and sealed with melted wax for an authentic feel.
                  </p>
                </div>
              </div>

              <div className="bg-black/30 border border-white/15 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition-all">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop"
                  alt="Ribbon tied"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Step 03 — Final Reveal</div>
                  <h3 className="font-podium text-xl uppercase font-bold text-white mb-2">Satin Bow & Protection</h3>
                  <p className="text-white/70 text-xs sm:text-sm font-inter leading-relaxed">
                    Finished with hand-tied double-satin ribbon and double-boxed for courier safety so the recipient receives perfection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 bg-gradient-to-r from-[#8c1119] via-[#4a070c] to-[#8c1119] border-t border-white/10 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-podium text-3xl sm:text-5xl font-extrabold uppercase text-white mb-4">
              Ready to Send Joy Today?
            </h2>
            <p className="text-white/80 text-sm sm:text-base font-inter max-w-xl mx-auto mb-8">
              Explore our ready-made hampers or create your own custom box item-by-item.
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-extrabold px-10 py-4 rounded-full text-sm uppercase tracking-widest transition-all cursor-pointer shadow-2xl shadow-amber-400/20 inline-flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Browse All Packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
