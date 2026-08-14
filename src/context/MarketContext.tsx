import React, { createContext, useContext, useState, useEffect } from 'react';

export type BuyerMarket = 'LOCAL' | 'INTERNATIONAL';
export type MarketCurrency = 'ETB' | 'USD';

interface MarketContextType {
  buyerMarket: BuyerMarket;
  currency: MarketCurrency;
  isDetecting: boolean;
  buyerCountry: string | null;
  setMarket: (market: BuyerMarket) => void;
}

const MarketContext = createContext<MarketContextType>({
  buyerMarket: 'LOCAL',
  currency: 'ETB',
  isDetecting: true,
  buyerCountry: null,
  setMarket: () => {},
});

const STORAGE_KEY = 'mbm_buyer_market';

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buyerMarket, setBuyerMarket] = useState<BuyerMarket>('LOCAL');
  const [currency, setCurrency] = useState<MarketCurrency>('ETB');
  const [isDetecting, setIsDetecting] = useState(true);
  const [buyerCountry, setBuyerCountry] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has manually selected a market before
    const stored = localStorage.getItem(STORAGE_KEY) as BuyerMarket | null;
    if (stored === 'LOCAL' || stored === 'INTERNATIONAL') {
      applyMarket(stored);
      setIsDetecting(false);
      return;
    }

    // Auto-detect via IP geolocation
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      setIsDetecting(true);
      // Using ipapi.co free tier — no API key required for basic detection
      const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        const countryCode = data?.country_code || '';
        setBuyerCountry(countryCode);
        const detected: BuyerMarket = countryCode === 'ET' ? 'LOCAL' : 'INTERNATIONAL';
        applyMarket(detected);
      } else {
        // Default to LOCAL on detection failure (safer for Ethiopian audience)
        applyMarket('LOCAL');
      }
    } catch {
      // Default to LOCAL on timeout/error
      applyMarket('LOCAL');
    } finally {
      setIsDetecting(false);
    }
  };

  const applyMarket = (market: BuyerMarket) => {
    setBuyerMarket(market);
    setCurrency(market === 'LOCAL' ? 'ETB' : 'USD');
  };

  const setMarket = (market: BuyerMarket) => {
    applyMarket(market);
    // Persist manual selection (overrides auto-detect on next visit)
    localStorage.setItem(STORAGE_KEY, market);
  };

  return (
    <MarketContext.Provider value={{ buyerMarket, currency, isDetecting, buyerCountry, setMarket }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
