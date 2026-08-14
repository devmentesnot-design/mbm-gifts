import type { MarketCurrency } from '../context/MarketContext';

/**
 * Centralized price formatter — supports ETB (local) and USD (international).
 */
export function formatPrice(amount: number, currency: MarketCurrency): string {
  const safe = isNaN(amount) ? 0 : amount;
  if (currency === 'USD') {
    return `$${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  }
  return `${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ብር`;
}

/**
 * Legacy helper — always formats in ETB. Use formatPrice() for market-aware formatting.
 */
export function formatCurrency(amount: number): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ብር`;
}

export function formatBirr(amount: number): string {
  return formatCurrency(amount);
}
