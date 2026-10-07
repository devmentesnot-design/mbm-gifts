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
    <section id="reviews" className="w-full px-6 sm:px-10 lg:px-16 py-20 lg:py-28 text-[#241A15] relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="text-[#8E6E2F] text-xs font-inter tracking-[0.25em] uppercase font-bold mb-2">
            Unboxing Stories
          </div>
          <h2 className="font-podium text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#241A15] leading-tight">
            {t('reviews.title')}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#D8C6A8]" />
            <div className="w-2 h-2 rotate-45 border border-[#D8C6A8] bg-[#B8944A]" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#D8C6A8]" />
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FBF8F2] border border-[#D8C6A8] hover:border-[#B8944A] p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#B8944A]/40 to-transparent" />
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 text-[#B8944A] mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#B8944A]" />
                  ))}
                </div>

                <p className="text-[#3A2A20] text-xs sm:text-sm font-inter leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#D8C6A8]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#B8944A]/60 shadow-sm"
                  />
                  <div>
                    <div className="font-bold text-xs text-[#241A15] font-inter">{rev.name}</div>
                    <div className="text-[10px] text-[#756457] font-inter">{rev.location}</div>
                  </div>
                </div>
                <span className="text-[10px] text-[#8E6E2F] uppercase tracking-widest font-inter font-bold bg-[#E6D5B8]/40 border border-[#D8C6A8] px-2.5 py-1 rounded-full">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* MBM Guarantees Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAF6EE] border border-[#D8C6A8] p-6 sm:p-8 rounded-3xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-podium text-base sm:text-lg uppercase font-bold text-[#241A15] tracking-wide">{t('reviews.guarantee1')}</div>
              <div className="text-[#756457] text-xs font-inter leading-relaxed">Every box is hand-wrapped and wax sealed.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#D8C6A8]/60 pt-4 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-podium text-base sm:text-lg uppercase font-bold text-[#241A15] tracking-wide">{t('reviews.guarantee2')}</div>
              <div className="text-[#756457] text-xs font-inter leading-relaxed">Tracked delivery direct to your recipient.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#D8C6A8]/60 pt-4 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-[#E6D5B8] border border-[#D8C6A8] text-[#8E6E2F] flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="font-podium text-base sm:text-lg uppercase font-bold text-[#241A15] tracking-wide">{t('reviews.guarantee3')}</div>
              <div className="text-[#756457] text-xs font-inter leading-relaxed">Delight guaranteed or full replacement.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

