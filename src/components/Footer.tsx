import React, { useState } from 'react';
import { Gift, Send, Instagram, Facebook, Twitter } from 'lucide-react';
import { LegalModal } from './LegalModal';
import { MarketChangeRequest } from './MarketChangeRequest';

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
    <footer className="w-full bg-[#380509] border-t border-white/10 text-white font-inter">
      {/* Newsletter Bar */}
      <div className="px-6 sm:px-10 lg:px-16 py-12 border-b border-white/10 bg-[#4a070c]/50">
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
                  className="bg-black/40 border border-white/20 rounded px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 w-full md:w-72"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-5 py-3 text-xs tracking-widest uppercase rounded flex items-center gap-1.5 transition-colors flex-shrink-0"
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
          <div className="flex items-center space-x-4 text-white/70">
            <a href="#" className="hover:text-amber-400 transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-amber-400 transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-amber-400 transition-colors"><Twitter className="w-5 h-5" /></a>
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
          {/* Low-profile region change — only for edge cases, not a casual switcher */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <MarketChangeRequest />
          </div>
        </div>

        <div>
          <div className="font-podium text-sm uppercase font-bold text-white mb-4 tracking-wider">
            Concierge Support
          </div>
          <div className="text-white/70 space-y-2">
            <div>Email: <span className="text-white">support@mbmgifts.com</span></div>
            <div>Phone: <span className="text-white">+251 911 00 00 00 / +251 922 00 00 00</span></div>
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
