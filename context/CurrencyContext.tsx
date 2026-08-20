'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { CurrencyCode } from '@/lib/types';
import { brandConfig } from '@/lib/brandConfig';

interface CurrencyContextType {
  currentCurrency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInUSD: number) => string;
  formatRawAmount: (priceInUSD: number) => number;
  currencies: typeof brandConfig.currencies;
  currentCurrencyConfig: typeof brandConfig.currencies[0];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const DEFAULT_CURRENCY: CurrencyCode = 'USD';

function subscribeCurrency(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('auralic_currency_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auralic_currency_change', callback);
  };
}

function getCurrencySnapshot(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const saved = localStorage.getItem('auralic_currency') as CurrencyCode;
    if (saved && brandConfig.currencies.some((c) => c.code === saved)) {
      return saved;
    }
  } catch {
    // fallback to default
  }
  return DEFAULT_CURRENCY;
}

function getCurrencyServerSnapshot(): CurrencyCode {
  return DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const currentCurrency = useSyncExternalStore(
    subscribeCurrency,
    getCurrencySnapshot,
    getCurrencyServerSnapshot
  );

  const handleSetCurrency = (code: CurrencyCode) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auralic_currency', code);
        window.dispatchEvent(new Event('auralic_currency_change'));
      } catch {
        // ignore write errors
      }
    }
  };

  const currentCurrencyConfig =
    brandConfig.currencies.find((c) => c.code === currentCurrency) || brandConfig.currencies[0];

  const formatRawAmount = (priceInUSD: number): number => {
    return Math.round(priceInUSD * currentCurrencyConfig.rateFromUSD);
  };

  const formatPrice = (priceInUSD: number): string => {
    const converted = formatRawAmount(priceInUSD);
    const symbol = currentCurrencyConfig.symbol;
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency: handleSetCurrency,
        formatPrice,
        formatRawAmount,
        currencies: brandConfig.currencies,
        currentCurrencyConfig,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
