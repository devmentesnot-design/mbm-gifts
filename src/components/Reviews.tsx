import React from 'react';
import { Star, ShieldCheck, HeartHandshake, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const REAL_REVIEWS = [
  {
    id: 1,
    name: 'Biniyam Taye',
    rating: 5,
    comment:
      "I am really happy with this kind of service. The delivery time was also exact, right on the promised day. I highly recommend MBM Gifts to others. It's really amazing service!",
    timeAgo: 'Yesterday',
  },
  {
    id: 2,
    name: 'Josef Tesfaye',
    rating: 5,
    comment: 'I ordered for my wife and the experience was amazing. Tnx a lot!',
    timeAgo: 'Yesterday',
  },
  {
    id: 3,
    name: 'Nathan Philipos',
    rating: 5,
    comment:
      'I kinda can say this is my fav spot and I like it. I hope people get this experience even more!',
    timeAgo: 'Yesterday',
  },
  {
    id: 4,
    name: 'Tsedeniya Behailu',
    rating: 5,
    comment:
      'Wonderful work — very cheerful!! I was so happy with their work. Definitely will be ordering so much gift and delivery! 🤗🤗',
    timeAgo: '3 days ago',
  },
  {
    id: 5,
    name: 'Abnet Tadiyos',
    rating: 5,
    comment:
      "I ordered personalized items like a watch, clothes, and sunglasses for a friend's birthday and the entire experience was exceptional. Top-tier quality and care!",
    timeAgo: '3 days ago',
  },
  {
    id: 6,
    name: 'Yabew Tk',
    rating: 5,
    comment:
      'I had the opportunity to see and explore the work behind MBM Gifts, and it is amazing — the creativity, presentation, and attention to detail are on another level.',
    timeAgo: '3 days ago',
  },
  {
    id: 7,
    name: 'Natnael Gizachew',
    rating: 5,
    comment:
      'I had a wonderful experience ordering a gift package through this website. The packages were well-organized, beautifully presented, and delivered with care.',
    timeAgo: '3 days ago',
  },
  {
    id: 8,
    name: 'Yeabsira Mengesha',
    rating: 5,
    comment: 'Good — clean, simple, and exactly what I needed. Totally satisfied!',
    timeAgo: '3 days ago',
  },
  {
    id: 9,
    name: 'Meles Tesfay',
    rating: 5,
    comment: 'I really thank you MBM Gifts 👍 I am satisfied with your services.',
    timeAgo: '3 days ago',
  },
  {
    id: 10,
    name: 'Kaleab Alemayehu',
    rating: 5,
    comment:
      "I used their services and everything was done on time. Great experience, and I'd definitely recommend them!",
    timeAgo: '3 days ago',
  },
  {
    id: 11,
    name: 'Nathaniel Tamirat',
    rating: 5,
    comment: 'Great gifts, affordable prices, and excellent customer service. Highly recommended!',
    timeAgo: '4 days ago',
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function avatarHue(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

const ReviewCard: React.FC<{ rev: (typeof REAL_REVIEWS)[0] }> = ({ rev }) => {

  const hue = avatarHue(rev.name);
  return (
    <div
      style={{
        minWidth: 300,
        maxWidth: 320,
        background: '#FBF8F2',
        border: '1px solid #D8C6A8',
        borderRadius: 24,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 4px 24px rgba(56,33,12,0.07)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* gold top accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 24,
          right: 24,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #B8944A55, transparent)',
        }}
      />
      {/* Stars */}
      <div style={{ display: 'flex', gap: 3 }}>
        {[...Array(rev.rating)].map((_, i) => (
          <Star key={i} style={{ width: 15, height: 15, fill: '#B8944A', color: '#B8944A' }} />
        ))}
      </div>
      {/* Comment */}
      <p
        style={{
          color: '#3A2A20',
          fontSize: 13,
          lineHeight: 1.65,
          fontStyle: 'italic',
          margin: 0,
          flexGrow: 1,
        }}
      >
        "{rev.comment}"
      </p>
      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #D8C6A840',
          paddingTop: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar with initials */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: `hsl(${hue},55%,82%)`,
              border: `2px solid hsl(${hue},45%,68%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              color: `hsl(${hue},40%,28%)`,
              flexShrink: 0,
              letterSpacing: 0.5,
            }}
          >
            {getInitials(rev.name)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#241A15' }}>{rev.name}</div>
            <div style={{ fontSize: 10, color: '#8E6E2F' }}>Google Review · {rev.timeAgo}</div>
          </div>
        </div>
        {/* Google G badge */}
        <div
          title="Verified Google Review"
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #D8C6A8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const Reviews: React.FC = () => {
  const { t } = useLanguage();
  const doubled = [...REAL_REVIEWS, ...REAL_REVIEWS];

  return (
    <section
      id="reviews"
      style={{ width: '100%', padding: '80px 0', color: '#241A15', position: 'relative', overflow: 'hidden' }}
    >
      {/* ── Section Header ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 48px' }}>
          <div
            style={{
              color: '#8E6E2F',
              fontSize: 11,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Real Google Reviews
          </div>
          <h2
            className="font-podium"
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              color: '#241A15',
              margin: '0 0 16px',
            }}
          >
            {t('reviews.title')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 1, background: 'linear-gradient(90deg, transparent, #D8C6A8)' }} />
            <div style={{ width: 8, height: 8, transform: 'rotate(45deg)', border: '1px solid #D8C6A8', background: '#B8944A' }} />
            <div style={{ width: 48, height: 1, background: 'linear-gradient(270deg, transparent, #D8C6A8)' }} />
          </div>
          {/* Overall rating pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 20,
              background: '#FBF8F2',
              border: '1px solid #D8C6A8',
              borderRadius: 99,
              padding: '8px 20px',
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} style={{ width: 14, height: 14, fill: '#B8944A', color: '#B8944A' }} />
            ))}
            <span style={{ fontSize: 13, fontWeight: 700, color: '#241A15' }}>5.0</span>
            <span style={{ fontSize: 12, color: '#756457' }}>· {REAL_REVIEWS.length} Verified Reviews</span>
          </div>
        </div>
      </div>

      {/* ── Marquee track (full-bleed) ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Left fade */}
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 80,
            background: 'linear-gradient(90deg, #fff 0%, transparent 100%)',
            zIndex: 2, pointerEvents: 'none',
          }}
        />
        {/* Right fade */}
        <div
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
            background: 'linear-gradient(270deg, #fff 0%, transparent 100%)',
            zIndex: 2, pointerEvents: 'none',
          }}
        />
        <div
          className="reviews-marquee"
          style={{
            display: 'flex',
            gap: 20,
            padding: '12px 16px 24px',
            width: 'max-content',
            animation: 'reviewsScroll 75s linear infinite',
          }}
        >
          {doubled.map((rev, idx) => (
            <ReviewCard key={`${rev.id}-${idx}`} rev={rev} />
          ))}
        </div>
      </div>

      {/* ── Guarantees bar ── */}
      <div style={{ maxWidth: 1280, margin: '48px auto 0', paddingLeft: 24, paddingRight: 24 }}>
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

      {/* Keyframe animation */}
      <style>{`
        @keyframes reviewsScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .reviews-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

