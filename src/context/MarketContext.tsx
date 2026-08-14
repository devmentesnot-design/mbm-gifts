import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type BuyerMarket = 'ETHIOPIA' | 'INTERNATIONAL';
export type MarketCurrency = 'ETB' | 'USD';

interface MarketContextType {
  buyerMarket: BuyerMarket;
  currency: MarketCurrency;
  isDetecting: boolean;
  buyerCountry: string | null;       // ISO-3166-1 alpha-2 code (e.g. "ET", "US")
  buyerCountryName: string | null;   // Human-readable country name (e.g. "Ethiopia", "United States")
  showWelcomeModal: boolean;         // true only on first visit, before user confirms
  hasConfirmed: boolean;             // becomes true after user clicks "Continue Shopping"
  confirmMarket: () => void;         // called by the welcome modal button
  requestMarketChange: (newMarket: BuyerMarket) => Promise<{ success: boolean; reason?: string }>;
}

const MarketContext = createContext<MarketContextType>({
  buyerMarket: 'ETHIOPIA',
  currency: 'ETB',
  isDetecting: true,
  buyerCountry: null,
  buyerCountryName: null,
  showWelcomeModal: false,
  hasConfirmed: false,
  confirmMarket: () => {},
  requestMarketChange: async () => ({ success: false }),
});

// ─── Cookie helpers ────────────────────────────────────────────────────────────
const COOKIE_NAME = 'mbm_market_v2';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

function setCookie(name: string, value: string, maxAge: number): void {
  // SameSite=Strict + no Secure flag since Vite dev runs on http
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  if (!match) return null;
  try {
    return decodeURIComponent(match.split('=')[1]);
  } catch {
    return null;
  }
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Strict`;
}

// ─── Stored market shape ───────────────────────────────────────────────────────
interface StoredMarket {
  market: BuyerMarket;
  currency: MarketCurrency;
  countryCode: string;
  countryName: string;
  confirmedAt: string; // ISO timestamp
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buyerMarket, setBuyerMarket] = useState<BuyerMarket>('ETHIOPIA');
  const [currency, setCurrency] = useState<MarketCurrency>('ETB');
  const [isDetecting, setIsDetecting] = useState(true);
  const [buyerCountry, setBuyerCountry] = useState<string | null>(null);
  const [buyerCountryName, setBuyerCountryName] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // ── Apply market state ────────────────────────────────────────────────────
  const applyMarket = useCallback((market: BuyerMarket, countryCode: string, countryName: string) => {
    const cur: MarketCurrency = market === 'ETHIOPIA' ? 'ETB' : 'USD';
    setBuyerMarket(market);
    setCurrency(cur);
    setBuyerCountry(countryCode);
    setBuyerCountryName(countryName);
  }, []);

  // ── Persist confirmed market to cookie + Supabase profile ─────────────────
  const persistMarket = useCallback(
    async (market: BuyerMarket, countryCode: string, countryName: string) => {
      const cur: MarketCurrency = market === 'ETHIOPIA' ? 'ETB' : 'USD';
      const stored: StoredMarket = {
        market,
        currency: cur,
        countryCode,
        countryName,
        confirmedAt: new Date().toISOString(),
      };
      setCookie(COOKIE_NAME, JSON.stringify(stored), COOKIE_MAX_AGE);

      // Also persist to Supabase profile if user is logged in
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await supabase
            .from('profiles')
            .update({
              market,
              currency: cur,
              country_code: countryCode,
              country_name: countryName,
            })
            .eq('id', session.user.id);
        }
      } catch {
        // Non-blocking — cookie is the source of truth for the frontend
      }
    },
    []
  );

  // ── Initial detection on first load ──────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // 1. Check for existing confirmed cookie
      const raw = getCookie(COOKIE_NAME);
      if (raw) {
        try {
          const stored: StoredMarket = JSON.parse(raw);
          if (stored.market === 'ETHIOPIA' || stored.market === 'INTERNATIONAL') {
            applyMarket(stored.market, stored.countryCode, stored.countryName);
            setHasConfirmed(true);
            setIsDetecting(false);
            return;
          }
        } catch {
          // Corrupt cookie — re-detect
          deleteCookie(COOKIE_NAME);
        }
      }

      // 2. Migrate legacy localStorage value if any
      const legacy = localStorage.getItem('mbm_buyer_market');
      if (legacy === 'LOCAL' || legacy === 'ETHIOPIA') {
        applyMarket('ETHIOPIA', 'ET', 'Ethiopia');
        setHasConfirmed(true);
        setIsDetecting(false);
        persistMarket('ETHIOPIA', 'ET', 'Ethiopia');
        localStorage.removeItem('mbm_buyer_market');
        return;
      }
      if (legacy === 'INTERNATIONAL') {
        applyMarket('INTERNATIONAL', 'INT', 'International');
        setHasConfirmed(true);
        setIsDetecting(false);
        persistMarket('INTERNATIONAL', 'INT', 'International');
        localStorage.removeItem('mbm_buyer_market');
        return;
      }

      // 3. No stored preference — detect via IP
      await detectLocation();
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── IP-based detection ────────────────────────────────────────────────────
  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      const res = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        const code: string = data?.country_code || 'ET';
        const name: string = data?.country_name || 'Ethiopia';
        const detected: BuyerMarket = code === 'ET' ? 'ETHIOPIA' : 'INTERNATIONAL';
        applyMarket(detected, code, name);
        // Show welcome modal — user must confirm before proceeding
        setShowWelcomeModal(true);
      } else {
        // Default to Ethiopia on API error
        applyMarket('ETHIOPIA', 'ET', 'Ethiopia');
        setShowWelcomeModal(true);
      }
    } catch {
      // Timeout or network error → default to Ethiopia
      applyMarket('ETHIOPIA', 'ET', 'Ethiopia');
      setShowWelcomeModal(true);
    } finally {
      setIsDetecting(false);
    }
  };

  // ── User confirms their market (Welcome Modal CTA) ─────────────────────────
  const confirmMarket = useCallback(() => {
    setShowWelcomeModal(false);
    setHasConfirmed(true);
    persistMarket(buyerMarket, buyerCountry || 'ET', buyerCountryName || 'Ethiopia');
  }, [buyerMarket, buyerCountry, buyerCountryName, persistMarket]);

  // ── Controlled market change from footer ──────────────────────────────────
  // Re-runs IP detection; if detected country matches requested market → allow.
  // If ambiguous (detection failure) → also allow (VPN/traveler case).
  // If detected country clearly contradicts → deny.
  const requestMarketChange = useCallback(
    async (newMarket: BuyerMarket): Promise<{ success: boolean; reason?: string }> => {
      if (newMarket === buyerMarket) {
        return { success: false, reason: 'You are already on this market.' };
      }

      try {
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(6000),
        });

        if (!res.ok) {
          // Detection failed → allow change (ambiguous case)
          applyMarket(newMarket, buyerCountry || 'ET', buyerCountryName || 'Ethiopia');
          await persistMarket(newMarket, buyerCountry || 'ET', buyerCountryName || 'Ethiopia');
          return { success: true };
        }

        const data = await res.json();
        const code: string = data?.country_code || '';
        const name: string = data?.country_name || '';
        const detectedMarket: BuyerMarket = code === 'ET' ? 'ETHIOPIA' : 'INTERNATIONAL';

        if (detectedMarket === newMarket) {
          // IP matches requested market — allow
          applyMarket(newMarket, code, name);
          await persistMarket(newMarket, code, name);
          return { success: true };
        } else {
          // IP contradicts request — deny
          return {
            success: false,
            reason: `Your current location (${name}) does not match the requested market. If you are using a VPN or traveling, please contact support to update your region.`,
          };
        }
      } catch {
        // Detection failed → allow change (ambiguous/VPN case)
        applyMarket(newMarket, buyerCountry || 'ET', buyerCountryName || 'Ethiopia');
        await persistMarket(newMarket, buyerCountry || 'ET', buyerCountryName || 'Ethiopia');
        return { success: true };
      }
    },
    [buyerMarket, buyerCountry, buyerCountryName, applyMarket, persistMarket]
  );

  return (
    <MarketContext.Provider
      value={{
        buyerMarket,
        currency,
        isDetecting,
        buyerCountry,
        buyerCountryName,
        showWelcomeModal,
        hasConfirmed,
        confirmMarket,
        requestMarketChange,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
