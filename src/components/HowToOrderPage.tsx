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
  FileText,
  Play,
  Video,
  ExternalLink
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
    <div className="min-h-screen w-full bg-transparent text-[#241A15] font-inter selection:bg-[#E6D5B8] selection:text-[#241A15] flex flex-col justify-between">
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
        <section className="relative pt-12 pb-16 px-4 sm:px-8 lg:px-12 bg-transparent overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#E6D5B8]/70 border border-[#D8C6A8] text-[#8E6E2F] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-[#B8944A]" />
              <span>Simple &amp; Seamless Gifting</span>
            </div>

            <h1 className="font-podium text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#241A15] mb-6 leading-tight">
              How To Order Your Luxury MBM Gift Box
            </h1>

            <p className="text-[#3A2A20] text-base sm:text-lg max-w-3xl mx-auto font-inter leading-relaxed mb-8">
              Whether you choose one of our expert-curated ready-made hampers or craft your own personalized box item-by-item, our ordering process is fast, flexible, and effortless.
            </p>

            {/* Mode Selector Tabs */}
            <div className="inline-flex p-1.5 luxury-satin-card rounded-full mb-2 shadow-sm border border-[#D8C6A8]">
              <button
                onClick={() => setActiveTab('prepared')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'prepared'
                    ? 'bg-[#241A15] text-[#FBF8F2] shadow-md font-extrabold'
                    : 'text-[#756457] hover:text-[#241A15]'
                }`}
              >
                1. Ready-Made Packages
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-[#241A15] text-[#FBF8F2] shadow-md font-extrabold'
                    : 'text-[#756457] hover:text-[#241A15]'
                }`}
              >
                2. Build Your Own Box
              </button>
            </div>
          </div>
        </section>

        {/* Video Tutorial Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 bg-transparent relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-[#E6D5B8]/70 border border-[#D8C6A8] text-[#8E6E2F] text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
                <Video className="w-4 h-4 text-[#8E6E2F]" />
                <span>Video Walkthrough</span>
              </div>
              <h2 className="font-podium text-2xl sm:text-4xl uppercase font-bold text-[#241A15] mb-2">
                {activeTab === 'prepared' ? 'Ready-Made Package Video Guide' : 'Build Your Own Box Video Guide'}
              </h2>
              <p className="text-[#756457] text-xs sm:text-sm font-inter max-w-xl mx-auto">
                {activeTab === 'prepared'
                  ? 'Watch our quick video on how to select, customize, and order ready-made luxury gift packages.'
                  : 'Watch our step-by-step video on how to handpick individual items and build a custom gift box.'}
              </p>
            </div>

            {/* Video Player Box */}
            <div className="luxury-satin-card rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-[#D8C6A8] shadow-xl max-w-4xl mx-auto">
              <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-[#D8C6A8]/60 shadow-inner">
                <iframe
                  key={activeTab}
                  className="w-full h-full"
                  src={
                    activeTab === 'prepared'
                      ? 'https://www.youtube.com/embed/B8A1WE0SEKw?rel=0'
                      : 'https://www.youtube.com/embed/fYNhoOMyRl8?rel=0'
                  }
                  title={activeTab === 'prepared' ? 'How to Order Ready-Made Package' : 'How to Build Your Own Gift Box'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Video Quick Switcher & YouTube Link */}
              <div className="mt-4 pt-4 border-t border-[#D8C6A8]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#756457] font-inter">
                  <Play className="w-3.5 h-3.5 text-[#8E6E2F] fill-[#8E6E2F]" />
                  <span>
                    Watching:{' '}
                    <strong className="text-[#241A15]">
                      {activeTab === 'prepared' ? 'Ready-Made Packages Guide' : 'Build Your Own Box Guide'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('prepared')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'prepared'
                        ? 'bg-[#241A15] text-[#FBF8F2] shadow-sm'
                        : 'bg-white/80 text-[#756457] hover:text-[#241A15] hover:bg-white border border-[#D8C6A8]'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Ready-Made Video</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'custom'
                        ? 'bg-[#241A15] text-[#FBF8F2] shadow-sm'
                        : 'bg-white/80 text-[#756457] hover:text-[#241A15] hover:bg-white border border-[#D8C6A8]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Build Your Own Video</span>
                  </button>
                  <a
                    href={activeTab === 'prepared' ? 'https://youtu.be/B8A1WE0SEKw' : 'https://youtu.be/fYNhoOMyRl8'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-white border border-[#D8C6A8] text-[#756457] hover:text-[#241A15] transition-all text-xs"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Detailed Visual Process */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-transparent relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-[#241A15] mb-4">
                {activeTab === 'prepared' ? 'Ready-Made Package Ordering' : 'Custom Box Curation Steps'}
              </h2>
              <p className="text-[#756457] text-sm sm:text-base font-inter">
                {activeTab === 'prepared'
                  ? 'Follow these 3 easy steps to order pre-curated hampers.'
                  : 'Follow these steps to handpick individual luxury gifts.'}
              </p>
            </div>

            {/* Step Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] hover:border-[#B8944A] rounded-3xl p-8 relative flex flex-col justify-between shadow-md hover:shadow-xl transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <span className="font-podium text-4xl font-extrabold text-[#D8C6A8] group-hover:text-[#8E6E2F] transition-colors">
                      01
                    </span>
                  </div>

                  <h3 className="font-podium text-2xl font-bold uppercase text-[#241A15] mb-3 group-hover:text-[#8E6E2F] transition-colors">
                    {activeTab === 'prepared' ? 'Select Prepared Package' : 'Pick Your Items'}
                  </h3>

                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed mb-4">
                    {activeTab === 'prepared'
                      ? 'Browse our curated collections (Romantic, Birthday, Executive, Self-Care). Click "View Details" to see every item included.'
                      : 'Switch to the "Build Your Own" tab in our shop. Browse chocolates, candles, crystal glasses, and leather goods and set quantities.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D8C6A8]/40 text-xs text-[#8E6E2F] font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instant Live Price Calculation</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] hover:border-[#B8944A] rounded-3xl p-8 relative flex flex-col justify-between shadow-md hover:shadow-xl transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center">
                      <PenTool className="w-7 h-7" />
                    </div>
                    <span className="font-podium text-4xl font-extrabold text-[#D8C6A8] group-hover:text-[#8E6E2F] transition-colors">
                      02
                    </span>
                  </div>

                  <h3 className="font-podium text-2xl font-bold uppercase text-[#241A15] mb-3 group-hover:text-[#8E6E2F] transition-colors">
                    Personal Note &amp; Wrap
                  </h3>

                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed mb-4">
                    Type your personal message for the recipient. We handwrite your note on heavy parchment paper and seal it with authentic red wax!
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D8C6A8]/40 text-xs text-[#8E6E2F] font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Wax Sealed Parchment Included</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="luxury-satin-card luxury-satin-card-hover border border-[#D8C6A8] hover:border-[#B8944A] rounded-3xl p-8 relative flex flex-col justify-between shadow-md hover:shadow-xl transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center">
                      <Truck className="w-7 h-7" />
                    </div>
                    <span className="font-podium text-4xl font-extrabold text-[#D8C6A8] group-hover:text-[#8E6E2F] transition-colors">
                      03
                    </span>
                  </div>

                  <h3 className="font-podium text-2xl font-bold uppercase text-[#241A15] mb-3 group-hover:text-[#8E6E2F] transition-colors">
                    Express Tracked Shipping
                  </h3>

                  <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed mb-4">
                    Enter recipient address, pick your delivery date, and complete checkout. Receive SMS &amp; email updates as your box is dispatched.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D8C6A8]/40 text-xs text-[#8E6E2F] font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Doorstep Delivery &amp; Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Live Calligraphy Card Note Interactive Previewer */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-transparent relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 bg-[#E6D5B8]/70 border border-[#D8C6A8] text-[#8E6E2F] text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
                <FileText className="w-4 h-4 text-[#8E6E2F]" />
                <span>Wax Sealed Note Customizer</span>
              </div>
              <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-[#241A15] mb-3">
                Preview Your Handwritten Card
              </h2>
              <p className="text-[#756457] text-sm sm:text-base font-inter">
                Test how your custom note will look when hand-transcribed onto parchment paper by our studio calligraphers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center luxury-satin-card border border-[#D8C6A8] rounded-3xl p-6 sm:p-10 shadow-xl">
              {/* Input Form */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#8E6E2F] mb-2">
                  Type Your Message Below:
                </label>
                <textarea
                  value={previewNote}
                  onChange={(e) => setPreviewNote(e.target.value)}
                  maxLength={180}
                  placeholder="Enter custom gift note message..."
                  className="w-full bg-white/80 border border-[#D8C6A8] rounded-2xl p-4 text-sm text-[#241A15] focus:outline-none focus:border-[#B8944A] h-36 resize-none font-inter mb-3 shadow-inner"
                />
                <div className="flex items-center justify-between text-xs text-[#756457]">
                  <span>Max 180 characters</span>
                  <span>{previewNote.length}/180</span>
                </div>
              </div>

              {/* Real-time Card Preview Box */}
              <div className="bg-[#FCF9F2] text-[#241A15] rounded-2xl p-6 sm:p-8 relative shadow-xl border-2 border-[#D8C6A8] transform rotate-1">
                {/* Wax Seal Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-800 rounded-full border-2 border-[#E6D5B8] shadow-md flex items-center justify-center text-[#E6D5B8] font-bold font-podium text-xs uppercase">
                  MBM
                </div>

                <div className="text-[11px] font-bold text-[#8E6E2F] uppercase tracking-widest mb-4 font-inter">
                  — Handwritten Calligraphy Card —
                </div>

                <p className="font-serif italic text-base sm:text-lg leading-relaxed mb-6 text-[#241A15]">
                  "{previewNote || 'Your note message here...'}"
                </p>

                <div className="pt-4 border-t border-[#D8C6A8]/40 flex items-center justify-between text-[11px] font-inter text-[#8E6E2F] font-bold uppercase">
                  <span>MBM Luxury Studio</span>
                  <span>Authentic Red Wax Seal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Frequently Asked Questions */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-transparent relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 text-[#8E6E2F] text-xs font-bold uppercase tracking-widest mb-2">
                <HelpCircle className="w-4 h-4 text-[#8E6E2F]" />
                <span>Got Questions?</span>
              </div>
              <h2 className="font-podium text-3xl sm:text-5xl uppercase font-bold text-[#241A15] mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-[#756457] text-sm sm:text-base font-inter">
                Everything you need to know about placing your gift order.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="luxury-satin-card border border-[#D8C6A8] rounded-2xl overflow-hidden shadow-sm transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-podium text-lg font-bold text-[#241A15] uppercase">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#8E6E2F] transition-transform duration-300 flex-shrink-0 ${
                        activeFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {activeFaq === idx && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#3A2A20] font-inter leading-relaxed border-t border-[#D8C6A8]/40 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call-to-action */}
        <section className="py-16 px-4 sm:px-8 lg:px-12 bg-gradient-to-r from-[#241A15] via-[#3A2A20] to-[#241A15] border-t border-[#D8C6A8]/30 text-center text-[#FBF8F2]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-podium text-3xl sm:text-5xl font-extrabold uppercase text-[#FBF8F2] mb-4">
              Ready to Place Your Order?
            </h2>
            <p className="text-[#F7F1E7]/80 text-sm sm:text-base font-inter max-w-xl mx-auto mb-8">
              Choose your favorite gift box or customize item-by-item today!
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="bg-[#E6D5B8] hover:bg-[#DCC39A] text-[#241A15] font-extrabold px-10 py-4 rounded-full text-sm uppercase tracking-widest transition-all cursor-pointer shadow-lg inline-flex items-center gap-2 transform hover:-translate-y-0.5"
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
