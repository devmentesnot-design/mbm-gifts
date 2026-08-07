import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-inter text-white">
      <div className="bg-[#240407] border border-amber-400/40 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[85vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
            {type === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-podium text-2xl uppercase tracking-wider text-white">
              {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h2>
            <p className="text-xs text-amber-300/80 font-mono">MBM Gifts • Effective August 2026</p>
          </div>
        </div>

        {/* Content Body */}
        {type === 'terms' ? (
          <div className="space-y-4 text-xs text-white/80 leading-relaxed font-light">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">1. Agreement to Terms</h3>
            <p>
              By accessing or placing an order through MBM Gifts, you agree to be bound by these Terms of Service. All orders placed are subject to inventory availability and phone verification prior to fulfillment.
            </p>

            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">2. Bespoke Orders & Customization</h3>
            <p>
              Handcrafted packages and custom gift boxes are prepared individually. Custom card notes, wax seals, and personalized gift ribbons are customized as submitted by the purchaser.
            </p>

            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">3. Pricing & Delivery</h3>
            <p>
              All prices listed are final. Express complimentary delivery is provided for qualified orders. Delivery addresses must be accurate to ensure on-time dispatch.
            </p>

            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">4. Satisfaction Guarantee & Returns</h3>
            <p>
              We inspect every item before sealing. If your order arrives damaged or incomplete, contact concierge support within 24 hours for a full replacement or refund.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-white/80 leading-relaxed font-light">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">1. Information Collection</h3>
            <p>
              We collect customer contact information (name, phone number, delivery address) solely for order fulfillment, phone verification, and delivery dispatch.
            </p>

            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">2. Recipient Privacy</h3>
            <p>
              Gift recipient information and personalized gift notes are kept strictly confidential. Prices are automatically concealed on recipient packing slips.
            </p>

            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">3. Data Security</h3>
            <p>
              Your data is encrypted and securely stored. We never sell, share, or monetize your personal information to third parties.
            </p>

            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">4. Contact Concierge</h3>
            <p>
              For privacy inquiries or data removal requests, email our concierge team at <span className="text-amber-300 font-medium">privacy@mbmgifts.com</span>.
            </p>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
