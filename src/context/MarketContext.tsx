import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type BuyerMarket = 'ETHIOPIA' | 'INTERNATIONAL';
export type MarketCurrency = 'ETB' | 'USD';

interface MarketContextType {
  buyerMarket: BuyerMarket;
  currency: MarketCurrency;
  isDetecting: boolean;
  buyerCountry: string | null;
  buyerCountryName: string | null;
  showWelcomeModal: boolean;
  hasConfirmed: boolean;
  confirmMarket: () => void;
  requestMarketChange: (newMarket: BuyerMarket) => Promise<{ success: boolean; reason?: string }>;
}

const MarketContext = createContext<MarketContextType>({
  buyerMarket: 'ETHIOPIA',
  currency: 'ETB',
  isDetecting: false,
  buyerCountry: 'ET',
  buyerCountryName: 'Ethiopia',
  showWelcomeModal: false,
  hasConfirmed: true,
  confirmMarket: () => {},
  requestMarketChange: async () => ({ success: false }),
});

// ─── Cookie helpers ────────────────────────────────────────────────────────────
const COOKIE_NAME = 'mbm_market_v2';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

function setCookie(name: string, value: string, maxAge: number): void {
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
  confirmedAt: string;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
// NOTE: Operating locally (Ethiopia only). IP detection and international market
// are disabled. All users default to Ethiopia / ETB with no welcome modal.
export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Market is permanently Ethiopia/ETB — no setter needed
  const [buyerMarket] = useState<BuyerMarket>('ETHIOPIA');
  const [currency] = useState<MarketCurrency>('ETB');
  const [isDetecting, setIsDetecting] = useState(true);
  const [buyerCountry] = useState<string>('ET');
  const [buyerCountryName] = useState<string>('Ethiopia');
  // Welcome modal permanently disabled
  const [showWelcomeModal] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // ── Persist confirmed market to cookie + Supabase profile ─────────────────
  const persistMarket = useCallback(async () => {
    const stored: StoredMarket = {
      market: 'ETHIOPIA',
      currency: 'ETB',
      countryCode: 'ET',
      countryName: 'Ethiopia',
      confirmedAt: new Date().toISOString(),
    };
    setCookie(COOKIE_NAME, JSON.stringify(stored), COOKIE_MAX_AGE);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase
          .from('profiles')
          .update({
            market: 'ETHIOPIA',
            currency: 'ETB',
            country_code: 'ET',
            country_name: 'Ethiopia',
          })
          .eq('id', session.user.id);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  // ── Initial load — always Ethiopia, no IP detection ────────────────────────
  useEffect(() => {
    const init = async () => {
      // Check for existing Ethiopia cookie
      const raw = getCookie(COOKIE_NAME);
      if (raw) {
        try {
          const stored: StoredMarket = JSON.parse(raw);
          if (stored.market === 'ETHIOPIA') {
            setHasConfirmed(true);
            setIsDetecting(false);
            return;
          }
        } catch {
          // Corrupt or stale cookie — clear it
        }
        // Clear any non-Ethiopia or corrupt cookie
        deleteCookie(COOKIE_NAME);
      }

      // Clear legacy localStorage entries
      localStorage.removeItem('mbm_buyer_market');

      // Persist Ethiopia as default and mark as confirmed
      await persistMarket();
      setHasConfirmed(true);
      setIsDetecting(false);
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── confirmMarket is a no-op (modal never shows) ──────────────────────────
  const confirmMarket = useCallback(() => {
    // No-op — welcome modal is disabled
  }, []);

  // ── Market change disabled (local-only operation) ─────────────────────────
  const requestMarketChange = useCallback(
    async (_newMarket: BuyerMarket): Promise<{ success: boolean; reason?: string }> => {
      return { success: false, reason: 'Market change is not available at this time.' };
    },
    []
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
