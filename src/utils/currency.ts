/**
 * Utility for formatting currency in Ethiopian Birr (ብር / ETB)
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
