import React from 'react';
import { Star, ShieldCheck, HeartHandshake, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Reviews: React.FC = () => {
  const { t } = useLanguage();

  const reviews = [
    {
      id: 1,
      name: 'Sophia L.',
      location: 'New York, NY',
      rating: 5,
      comment: 'The Crimson Velvet box exceeded all expectations! The velvet ribbon and custom wax-sealed note made my partner tear up. Truly luxury experience.',
      giftName: 'Velvet Romance Bundle',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'Marcus K.',
      location: 'Chicago, IL',
      rating: 5,
      comment: 'Built a custom box for our corporate VIP clients. The interactive box builder made it super easy to select single-origin coffee and artisan truffles.',
      giftName: 'Custom Executive Box',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 3,
      name: 'Elena & David R.',
      location: 'Los Angeles, CA',
      rating: 5,
      comment: 'MBM Gifts sent our 10th Anniversary box right on time. The crystal flutes and preserved rose packaging were stunning. 10/10 recommendation!',
      giftName: 'Golden Jubilee Box',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    },
  ];

  return (
    <section id="reviews" className="w-full px-6 sm:px-10 lg:px-16 py-20 lg:py-28 bg-[#8c1119] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="text-amber-300 text-xs font-inter tracking-[0.25em] uppercase font-semibold mb-2">
            Unboxing Stories
          </div>
          <h2 className="font-oswald text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wide leading-tight">
            {t('reviews.title')}
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#4a070c] border border-white/10 p-6 rounded-lg flex flex-col justify-between hover:border-amber-400/40 transition-colors"
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-white/80 text-xs font-inter leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-400/50"
                  />
                  <div>
                    <div className="font-bold text-xs text-white font-inter">{rev.name}</div>
                    <div className="text-[10px] text-white/50 font-inter">{rev.location}</div>
                  </div>
                </div>
                <span className="text-[10px] text-amber-300/80 uppercase tracking-widest font-inter">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* MBM Guarantees Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#380509] border border-white/10 p-6 sm:p-8 rounded-lg">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-inter text-base sm:text-lg uppercase font-bold text-white tracking-wide">{t('reviews.guarantee1')}</div>
              <div className="text-white/60 text-xs font-inter leading-relaxed">Every box is hand-wrapped and wax sealed.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <Truck className="w-8 h-8 text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-inter text-base sm:text-lg uppercase font-bold text-white tracking-wide">{t('reviews.guarantee2')}</div>
              <div className="text-white/60 text-xs font-inter leading-relaxed">Tracked delivery direct to your recipient.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <HeartHandshake className="w-8 h-8 text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-inter text-base sm:text-lg uppercase font-bold text-white tracking-wide">{t('reviews.guarantee3')}</div>
              <div className="text-white/60 text-xs font-inter leading-relaxed">Delight guaranteed or full replacement.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

