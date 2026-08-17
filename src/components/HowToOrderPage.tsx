import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartItem } from '../types/cart';
import {
  ShoppingBag,
  PenTool,
  Truck,
  CheckCircle2,
  Sparkles,
  Gift,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Package,
  Clock,
  Heart,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HowToOrderPageProps {
  session: any;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onNavigateToLogin: () => void;
  onNavigate: (path: string) => void;
}

export const HowToOrderPage: React.FC<HowToOrderPageProps> = ({
  session,
  cartItems,
  onOpenCart,
  onNavigateToLogin,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'prepared' | 'custom'>('prepared');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [previewNote, setPreviewNote] = useState('Wishing you a birthday filled with love, laughter, and endless luxury!');

  const faqs = [
    {
      q: 'Can I send the gift directly to the recipient?',
      a: 'Yes! During checkout, simply enter your recipient’s shipping address. We handle white-glove packaging, wax sealing, and doorstep delivery with live tracking.'
    },
    {
      q: 'Will the package include price receipts inside?',
      a: 'Never! All MBM gift boxes are delivered without prices or invoices. Your order receipt and payment details are sent confidentially to your email address.'
    },
    {
      q: 'How long does express delivery take?',
      a: 'Standard delivery takes 1–3 business days. We also offer Same-Day Express Delivery in select metro areas when ordered before 1:00 PM.'
    },
    {
      q: 'Can I request custom corporate or bulk orders?',
      a: 'Absolutely. We offer branded wax seals, custom logo ribbons, and bulk corporate pricing for teams, clients, and weddings. Contact us via the customizer or email.'
    },
    {
      q: 'What if an item arrives damaged or broken?',
      a: 'We pack every item in protective velvet lining and reinforced outer courier boxes. In the rare event of transit damage, notify us within 24 hours for a instant replacement.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-transparent text-[#FFF8ED] font-inter selection:bg-[#D9A514] selection:text-[#2B0005] flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar
        session={session}
        cartItems={cartItems}
        onOpenCart={onOpenCart}
        onNavigateToLogin={onNavigateToLogin}
        onNavigate={onNavigate}
      />

      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="relative pt-12 pb-20 px-4 sm:px-8 lg:px-12 bg-[#2B0005]/40 backdrop-blur-[2px] border-b border-[#D9A514]/15 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#D9A514]/15 border border-[#D9A514]/30 text-[#F5C542] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-[#F5C542]" />
              <span>Simple & Seamless Gifting</span>
            </div>

            <h1 className="font-podium text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white mb-6 leading-tight">
              How To Order Your Luxury MBM Gift Box
            </h1>

            <p className="text-white/85 text-base sm:text-lg max-w-3xl mx-auto font-inter leading-relaxed mb-8">
              Whether you choose one of our expert-curated ready-made hampers or craft your own personalized box item-by-item, our ordering process is fast, flexible, and effortless.
            </p>

            {/* Mode Selector Tabs */}
            <div className="inline-flex p-1.5 bg-black/40 border border-white/20 rounded-full mb-6">
              <button
                onClick={() => setActiveTab('prepared')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'prepared'
                    ? 'bg-amber-400 text-[#8c1119] shadow-lg font-extrabold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                1. Ready-Made Packages
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-amber-400 text-[#8c1119] shadow-lg font-extrabold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                2. Build Your Own Box
              </button>
            </div>
          </div>
        </section>

        {/* 3-Step Detailed Visual Process */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 border-t border-white/10 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-white mb-4">
                {activeTab === 'prepared' ? 'Ready-Made Package Ordering' : 'Custom Box Curation Steps'}
              </h2>
              <p className="text-white/80 text-sm sm:text-base font-inter">
                {activeTab === 'prepared'
                  ? 'Follow these 3 easy steps to order pre-curated hampers.'
                  : 'Follow these steps to handpick individual luxury gifts.'}
              </p>
            </div>

            {/* Step Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="luxury-satin-card luxury-satin-card-hover rounded-3xl p-8 relative flex flex-col justify-between shadow-xl group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <span className="font-podium text-4xl font-extrabold text-amber-300/30 group-hover:text-amber-300 transition-colors">
                      01
                    </span>
                  </div>

                  <h3 className="font-podium text-2xl font-bold uppercase text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {activeTab === 'prepared' ? 'Select Prepared Package' : 'Pick Your Items'}
                  </h3>

                  <p className="text-white/75 text-xs sm:text-sm font-inter leading-relaxed mb-4">
                    {activeTab === 'prepared'
                      ? 'Browse our curated collections (Romantic, Birthday, Executive, Self-Care). Click "View Details" to see every item included.'
                      : 'Switch to the "Build Your Own" tab in our shop. Browse chocolates, candles, crystal glasses, and leather goods and set quantities.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instant Live Price Calculation</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="luxury-satin-card luxury-satin-card-hover rounded-3xl p-8 relative flex flex-col justify-between shadow-xl group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                      <PenTool className="w-7 h-7" />
                    </div>
                    <span className="font-podium text-4xl font-extrabold text-amber-300/30 group-hover:text-amber-300 transition-colors">
                      02
                    </span>
                  </div>

                  <h3 className="font-podium text-2xl font-bold uppercase text-white mb-3 group-hover:text-amber-300 transition-colors">
                    Personal Note & Wrap
                  </h3>

                  <p className="text-white/75 text-xs sm:text-sm font-inter leading-relaxed mb-4">
                    Type your personal message for the recipient. We handwrite your note on heavy parchment paper and seal it with authentic red wax!
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Wax Sealed Parchment Included</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="luxury-satin-card luxury-satin-card-hover rounded-3xl p-8 relative flex flex-col justify-between shadow-xl group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                      <Truck className="w-7 h-7" />
                    </div>
                    <span className="font-podium text-4xl font-extrabold text-amber-300/30 group-hover:text-amber-300 transition-colors">
                      03
                    </span>
                  </div>

                  <h3 className="font-podium text-2xl font-bold uppercase text-white mb-3 group-hover:text-amber-300 transition-colors">
                    Express Tracked Shipping
                  </h3>

                  <p className="text-white/75 text-xs sm:text-sm font-inter leading-relaxed mb-4">
                    Enter recipient address, pick your delivery date, and complete checkout. Receive SMS & email updates as your box is dispatched.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Doorstep Delivery & Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Live Calligraphy Card Note Interactive Previewer */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-[#2e0508] border-t border-white/10 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3">
                <FileText className="w-4 h-4" />
                <span>Wax Sealed Note Customizer</span>
              </div>
              <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-white mb-3">
                Preview Your Handwritten Card
              </h2>
              <p className="text-white/75 text-sm sm:text-base font-inter">
                Test how your custom note will look when hand-transcribed onto parchment paper by our studio calligraphers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 border border-white/15 rounded-3xl p-6 sm:p-10">
              {/* Input Form */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-amber-300 mb-2">
                  Type Your Message Below:
                </label>
                <textarea
                  value={previewNote}
                  onChange={(e) => setPreviewNote(e.target.value)}
                  maxLength={180}
                  placeholder="Enter custom gift note message..."
                  className="w-full bg-black/50 border border-white/20 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-amber-400 h-36 resize-none font-inter mb-3"
                />
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>Max 180 characters</span>
                  <span>{previewNote.length}/180</span>
                </div>
              </div>

              {/* Real-time Card Preview Box */}
              <div className="bg-[#fdfbf7] text-[#2c1810] rounded-2xl p-6 sm:p-8 relative shadow-2xl border-4 border-amber-900/20 transform rotate-1">
                {/* Wax Seal Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-700 rounded-full border-2 border-amber-300 shadow-lg flex items-center justify-center text-amber-200 font-bold font-podium text-xs uppercase">
                  MBM
                </div>

                <div className="text-[11px] font-bold text-amber-900/60 uppercase tracking-widest mb-4 font-inter">
                  — Handwritten Calligraphy Card —
                </div>

                <p className="font-serif italic text-base sm:text-lg leading-relaxed mb-6 text-[#2c1810]">
                  "{previewNote || 'Your note message here...'}"
                </p>

                <div className="pt-4 border-t border-amber-900/10 flex items-center justify-between text-[11px] font-inter text-amber-900/70 font-bold uppercase">
                  <span>MBM Luxury Studio</span>
                  <span>Authentic Red Wax Seal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Frequently Asked Questions */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 border-t border-white/10 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Got Questions?</span>
              </div>
              <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-white mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-white/75 text-sm sm:text-base font-inter">
                Everything you need to know about placing your gift order.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-[#4a070c]/80 border border-white/15 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-podium text-lg font-bold text-white uppercase">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-amber-300 transition-transform duration-300 flex-shrink-0 ${
                        activeFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {activeFaq === idx && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-white/80 font-inter leading-relaxed border-t border-white/10 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call-to-action */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 bg-gradient-to-r from-[#8c1119] via-[#4a070c] to-[#8c1119] border-t border-white/10 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-podium text-3xl sm:text-5xl font-extrabold uppercase text-white mb-4">
              Ready to Place Your Order?
            </h2>
            <p className="text-white/80 text-sm sm:text-base font-inter max-w-xl mx-auto mb-8">
              Choose your favorite gift box or customize item-by-item today!
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-extrabold px-10 py-4 rounded-full text-sm uppercase tracking-widest transition-all cursor-pointer shadow-2xl shadow-amber-400/20 inline-flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Go to Gift Shop</span>
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
