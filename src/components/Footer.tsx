import React, { useState } from 'react';
import { Gift, Send, Instagram, Facebook } from 'lucide-react';
import { LegalModal } from './LegalModal';


export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#1d0004]/85 backdrop-blur-md border-t border-[#D9A514]/20 text-[#FFF8ED] font-inter">
      {/* Newsletter Bar */}
      <div className="px-6 sm:px-10 lg:px-16 py-12 border-b border-[#D9A514]/15 bg-[#230005]/70">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-podium text-2xl uppercase font-bold text-white mb-1">
              Join the MBM Inner Circle
            </h3>
            <p className="text-white/70 text-xs max-w-md">
              Subscribe to receive 10% off your first gift order and access exclusive seasonal package releases.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2">
            {subscribed ? (
              <div className="text-amber-300 font-bold text-xs uppercase tracking-wider bg-amber-400/10 border border-amber-400/30 px-6 py-3 rounded">
                ✓ You're subscribed! Use code MBM10 at checkout.
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="bg-black/50 border border-[#D9A514]/30 rounded-xl px-4 py-3 text-xs text-[#FFF8ED] placeholder-[#FFF8ED]/40 focus:outline-none focus:border-[#F5C542] w-full md:w-72"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#F5C542] to-[#D9A514] hover:from-[#F5C542] hover:to-[#e6b015] text-[#2B0005] font-extrabold px-6 py-3 text-xs tracking-widest uppercase rounded-xl flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer shadow-md"
                >
                  <span>JOIN</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Links Grid */}
      <div className="px-6 sm:px-10 lg:px-16 py-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
        <div>
          <div className="mb-4">
            <img
              src="/logo.png"
              alt="MBM Gifts"
              referrerPolicy="no-referrer"
              className="h-14 w-auto object-contain scale-[2.5] origin-left drop-shadow-md"
            />
          </div>
          <p className="text-white/60 leading-relaxed mb-4">
            Curated luxury gift packages and bespoke custom box creations. Handcrafted with passion and wax-sealed for life's most cherished moments.
          </p>
          <div className="flex items-center space-x-3 text-white/80">
            <a
              href="https://www.instagram.com/mbmgifts"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow MBM Gifts on Instagram"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg shadow-black/40"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61593057843519&mibextid=ZbWKwL"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow MBM Gifts on Facebook"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-transparent hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg shadow-black/40"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://www.tiktok.com/@mbmgifts.official?_r=1&_t=ZS-98kF663UmiW"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow MBM Gifts on TikTok"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-black hover:border-white/30 hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg shadow-black/40 group"
            >
              <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.34 6.34 0 0 0 1.97-4.48V8.75a8.28 8.28 0 0 0 4.8 1.51V6.8a4.85 4.85 0 0 1-1-.11z"/>
              </svg>
            </a>
            <a
              href="https://t.me/+J7buYU7m8vQ5NmY0"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow MBM Gifts on Telegram"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#229ED9] hover:border-transparent hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg shadow-black/40 group"
            >
              <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.12-.05-.18-.06-.05-.15-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.15 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.24-.03.38z"/>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <div className="font-podium text-sm uppercase font-bold text-white mb-4 tracking-wider">
            Gift Collections
          </div>
          <ul className="space-y-2.5 text-white/70">
            <li><a href="#packages" className="hover:text-white transition-colors">Prepared Packages</a></li>
            <li><a href="#customizer" className="hover:text-white transition-colors">Custom Gift Box Builder</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">Luxury Crimson Edition</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">Anniversary & Romance</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">Corporate Executive Reserve</a></li>
          </ul>
        </div>

        <div>
          <div className="font-podium text-sm uppercase font-bold text-white mb-4 tracking-wider">
            Customer Care
          </div>
          <ul className="space-y-2.5 text-white/70">
            <li><button onClick={() => setLegalModal('terms')} className="hover:text-amber-300 transition-colors text-left cursor-pointer">Terms of Service</button></li>
            <li><button onClick={() => setLegalModal('privacy')} className="hover:text-amber-300 transition-colors text-left cursor-pointer">Privacy Policy</button></li>
            <li><a href="/my-orders" className="hover:text-white transition-colors">Track Order Status</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">Hand-Packed Guarantee</a></li>
            <li><a href="#packages" className="hover:text-white transition-colors">Corporate Bulk Gifting</a></li>
          </ul>
        </div>

        <div>
          <div className="font-podium text-sm uppercase font-bold text-white mb-4 tracking-wider">
            Concierge Support
          </div>
          <div className="text-white/70 space-y-2">
            <div>Email: <a href="mailto:hello.mbmgifts@gmail.com" className="text-white hover:text-amber-300 transition-colors font-medium">hello.mbmgifts@gmail.com</a></div>
            <div>Phone: <a href="tel:+251919580425" className="text-white hover:text-amber-300 transition-colors font-medium">091 958 0425</a> / <a href="tel:+251935538009" className="text-white hover:text-amber-300 transition-colors font-medium">093 553 8009</a></div>
            <div>Headquarters: <span className="text-white">Bole Luxury District, Addis Ababa, Ethiopia</span></div>
            <div className="text-amber-300 font-bold mt-2 flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>24/7 Round-The-Clock Service Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Rights */}
      <div className="px-6 sm:px-10 lg:px-16 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/40 uppercase tracking-widest gap-2">
        <div>© {new Date().getFullYear()} MBM GIFTS INC. ALL RIGHTS RESERVED.</div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLegalModal('terms')} className="hover:text-amber-300 transition-colors cursor-pointer">Terms of Service</button>
          <span>•</span>
          <button onClick={() => setLegalModal('privacy')} className="hover:text-amber-300 transition-colors cursor-pointer">Privacy Policy</button>
        </div>
      </div>

      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </footer>
  );
};
