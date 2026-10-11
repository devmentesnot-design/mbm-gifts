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
    <div className="min-h-screen w-full bg-transparent text-[#241A15] font-inter selection:bg-[#E6D5B8] selection:text-[#241A15] flex flex-col justify-between">
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
        <section className="relative pt-12 pb-16 px-4 sm:px-8 lg:px-12 bg-transparent overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E6D5B8]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#E6D5B8]/70 border border-[#D8C6A8] text-[#8E6E2F] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#B8944A]" />
              <span>{t('about.badge')}</span>
            </div>

            <h1 className="font-podium text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#241A15] mb-6 leading-tight">
              {t('about.title')}
            </h1>

            <p className="text-[#3A2A20] text-base sm:text-lg max-w-3xl mx-auto font-inter leading-relaxed mb-8">
              {t('about.subtitle')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('/')}
                className="bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>{t('about.exploreBtn')}</span>
                <ArrowRight className="w-4 h-4 text-[#E6D5B8]" />
              </button>

              <button
                onClick={() => onNavigate('/how-to-order')}
                className="luxury-satin-card hover:bg-white text-[#241A15] border border-[#D8C6A8] font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <span>{t('about.guideBtn')}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 1: Our Story & Founding Legacy */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-transparent relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Image Column */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden border border-[#D8C6A8] shadow-2xl group bg-white/40">
                  <img
                    src="/about us page.jpg"
                    alt="MBM Gifts luxury gift box packing"
                    className="w-full h-80 sm:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241A15]/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#241A15]/85 backdrop-blur-md border border-[#D8C6A8]/30 rounded-2xl">
                    <p className="font-podium text-sm uppercase font-bold text-[#E6D5B8] mb-1">
                      {t('about.established')}
                    </p>
                    <p className="text-[#F7F1E7]/90 text-xs font-inter leading-relaxed">
                      {t('about.studioCraft')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Column */}
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 text-[#8E6E2F] text-xs font-bold uppercase tracking-widest mb-2">
                  <Heart className="w-4 h-4 text-[#B8944A]" />
                  <span>{t('about.visionBadge')}</span>
                </div>
                <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-[#241A15] mb-6 leading-tight">
                  {t('about.visionTitle')}
                </h2>
                <div className="space-y-4 text-[#3A2A20] text-sm sm:text-base font-inter leading-relaxed">
                  <p>{t('about.visionP1')}</p>
                  <p>{t('about.visionP2')}</p>
                  <p>{t('about.visionP3')}</p>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#D8C6A8]/40 text-center">
                  <div className="luxury-satin-card border border-[#D8C6A8] rounded-2xl p-4 shadow-sm">
                    <div className="font-podium text-2xl sm:text-3xl font-extrabold text-[#241A15]">10k+</div>
                    <div className="text-[10px] sm:text-xs text-[#756457] uppercase tracking-wider font-bold mt-1">{t('about.stat1')}</div>
                  </div>
                  <div className="luxury-satin-card border border-[#D8C6A8] rounded-2xl p-4 shadow-sm">
                    <div className="font-podium text-2xl sm:text-3xl font-extrabold text-[#241A15]">100%</div>
                    <div className="text-[10px] sm:text-xs text-[#756457] uppercase tracking-wider font-bold mt-1">{t('about.stat2')}</div>
                  </div>
                  <div className="luxury-satin-card border border-[#D8C6A8] rounded-2xl p-4 shadow-sm">
                    <div className="font-podium text-2xl sm:text-3xl font-extrabold text-[#241A15]">4.9/5</div>
                    <div className="text-[10px] sm:text-xs text-[#756457] uppercase tracking-wider font-bold mt-1">{t('about.stat3')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Core Pillars of Excellence */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-transparent relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 bg-[#E6D5B8]/70 border border-[#D8C6A8] text-[#8E6E2F] text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
                <Award className="w-4 h-4 text-[#B8944A]" />
                <span>{t('about.pillarsBadge')}</span>
              </div>
              <h2 className="font-podium text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#241A15] mb-4">
                {t('about.pillarsTitle')}
              </h2>
              <p className="text-[#756457] text-sm sm:text-base font-inter leading-relaxed">
                {t('about.pillarsSub')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] hover:border-[#B8944A] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-md group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h3 className="font-podium text-xl font-bold uppercase text-[#241A15] mb-2 group-hover:text-[#8E6E2F] transition-colors">
                    {t('about.p1Title')}
                  </h3>
                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed">
                    {t('about.p1Desc')}
                  </p>
                </div>
              </div>

              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] hover:border-[#B8944A] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-md group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Feather className="w-6 h-6" />
                  </div>
                  <h3 className="font-podium text-xl font-bold uppercase text-[#241A15] mb-2 group-hover:text-[#8E6E2F] transition-colors">
                    {t('about.p2Title')}
                  </h3>
                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed">
                    {t('about.p2Desc')}
                  </p>
                </div>
              </div>

              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] hover:border-[#B8944A] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-md group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-podium text-xl font-bold uppercase text-[#241A15] mb-2 group-hover:text-[#8E6E2F] transition-colors">
                    {t('about.p3Title')}
                  </h3>
                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed">
                    {t('about.p3Desc')}
                  </p>
                </div>
              </div>

              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] hover:border-[#B8944A] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-md group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="font-podium text-xl font-bold uppercase text-[#241A15] mb-2 group-hover:text-[#8E6E2F] transition-colors">
                    {t('about.p4Title')}
                  </h3>
                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed">
                    {t('about.p4Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Behind The Scenes Studio Workflow */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-transparent relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 text-[#8E6E2F] text-xs font-bold uppercase tracking-widest mb-2">
                <Package className="w-4 h-4 text-[#B8944A]" />
                <span>{t('about.processBadge')}</span>
              </div>
              <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-[#241A15] mb-4">
                {t('about.processTitle')}
              </h2>
              <p className="text-[#756457] text-sm sm:text-base font-inter">
                {t('about.processSub')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] rounded-3xl overflow-hidden flex flex-col justify-between hover:border-[#B8944A] transition-all shadow-md">
                <img
                  src="/images/quality-inspection.png"
                  alt="Rigorous Quality Inspection"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-xs font-bold text-[#8E6E2F] uppercase tracking-wider mb-1">{t('about.step1Badge')}</div>
                  <h3 className="font-podium text-xl uppercase font-bold text-[#241A15] mb-2">{t('about.step1Title')}</h3>
                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed">
                    {t('about.step1Desc')}
                  </p>
                </div>
              </div>

              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] rounded-3xl overflow-hidden flex flex-col justify-between hover:border-[#B8944A] transition-all shadow-md">
                <img
                  src="/images/handwritten-note.png"
                  alt="Handwritten Calligraphy note"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-xs font-bold text-[#8E6E2F] uppercase tracking-wider mb-1">{t('about.step2Badge')}</div>
                  <h3 className="font-podium text-xl uppercase font-bold text-[#241A15] mb-2">{t('about.step2Title')}</h3>
                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed">
                    {t('about.step2Desc')}
                  </p>
                </div>
              </div>

              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] rounded-3xl overflow-hidden flex flex-col justify-between hover:border-[#B8944A] transition-all shadow-md">
                <img
                  src="/images/step3-reveal.png"
                  alt="Final Reveal and satin ribbon"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-xs font-bold text-[#8E6E2F] uppercase tracking-wider mb-1">{t('about.step3Badge')}</div>
                  <h3 className="font-podium text-xl uppercase font-bold text-[#241A15] mb-2">{t('about.step3Title')}</h3>
                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed">
                    {t('about.step3Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 bg-gradient-to-r from-[#241A15] via-[#3A2A20] to-[#241A15] border-t border-[#D8C6A8]/30 text-center text-[#FBF8F2]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-podium text-3xl sm:text-5xl font-extrabold uppercase text-[#FBF8F2] mb-4">
              {t('about.ctaTitle')}
            </h2>
            <p className="text-[#F7F1E7]/80 text-sm sm:text-base font-inter max-w-xl mx-auto mb-8">
              {t('about.ctaSub')}
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="bg-[#E6D5B8] hover:bg-[#DCC39A] text-[#241A15] font-extrabold px-10 py-4 rounded-full text-sm uppercase tracking-widest transition-all cursor-pointer shadow-lg inline-flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>{t('about.ctaBtn')}</span>
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
