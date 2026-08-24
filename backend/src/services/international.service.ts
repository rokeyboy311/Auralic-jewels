/**
 * Enterprise Internationalization (i18n), Multi-Currency, and Dynamic Duty/Tax Computation Engine
 */

export interface CurrencyRate {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = X Local Currency
  decimalPlaces: number;
}

export interface TaxDutyRule {
  countryCode: string;
  countryName: string;
  vatGstRate: number; // Percentage, e.g. 20 for UK VAT
  importDutyRate: number; // Average luxury jewellery tariff
  requiresPassportForCustoms: boolean;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0, decimalPlaces: 0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92, decimalPlaces: 0 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.79, decimalPlaces: 0 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToUSD: 0.88, decimalPlaces: 0 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToUSD: 3.67, decimalPlaces: 0 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 1.34, decimalPlaces: 0 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rateToUSD: 7.82, decimalPlaces: 0 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 154.5, decimalPlaces: 0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 86.5, decimalPlaces: 0 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.39, decimalPlaces: 0 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.54, decimalPlaces: 0 },
};

export const TAX_DUTY_REGISTRY: Record<string, TaxDutyRule> = {
  US: { countryCode: 'US', countryName: 'United States', vatGstRate: 0.0, importDutyRate: 0.0, requiresPassportForCustoms: false },
  GB: { countryCode: 'GB', countryName: 'United Kingdom', vatGstRate: 20.0, importDutyRate: 2.5, requiresPassportForCustoms: false },
  FR: { countryCode: 'FR', countryName: 'France', vatGstRate: 20.0, importDutyRate: 2.5, requiresPassportForCustoms: false },
  DE: { countryCode: 'DE', countryName: 'Germany', vatGstRate: 19.0, importDutyRate: 2.5, requiresPassportForCustoms: false },
  CH: { countryCode: 'CH', countryName: 'Switzerland', vatGstRate: 8.1, importDutyRate: 0.0, requiresPassportForCustoms: false },
  AE: { countryCode: 'AE', countryName: 'United Arab Emirates', vatGstRate: 5.0, importDutyRate: 5.0, requiresPassportForCustoms: false },
  SG: { countryCode: 'SG', countryName: 'Singapore', vatGstRate: 9.0, importDutyRate: 0.0, requiresPassportForCustoms: false },
  HK: { countryCode: 'HK', countryName: 'Hong Kong', vatGstRate: 0.0, importDutyRate: 0.0, requiresPassportForCustoms: false },
  JP: { countryCode: 'JP', countryName: 'Japan', vatGstRate: 10.0, importDutyRate: 5.2, requiresPassportForCustoms: false },
  IN: { countryCode: 'IN', countryName: 'India', vatGstRate: 3.0, importDutyRate: 15.0, requiresPassportForCustoms: true },
  CA: { countryCode: 'CA', countryName: 'Canada', vatGstRate: 13.0, importDutyRate: 6.5, requiresPassportForCustoms: false },
  AU: { countryCode: 'AU', countryName: 'Australia', vatGstRate: 10.0, importDutyRate: 5.0, requiresPassportForCustoms: false },
};

export class InternationalService {
  /**
   * Convert USD monetary value to target currency
   */
  static convertFromUSD(amountUSD: number, targetCurrency: string): { amount: number; formatted: string; currency: CurrencyRate } {
    const cur = SUPPORTED_CURRENCIES[targetCurrency.toUpperCase()] || SUPPORTED_CURRENCIES.USD;
    const converted = amountUSD * cur.rateToUSD;
    const rounded = cur.decimalPlaces === 0 ? Math.round(converted) : parseFloat(converted.toFixed(cur.decimalPlaces));

    const formatted = `${cur.symbol}${rounded.toLocaleString('en-US', {
      minimumFractionDigits: cur.decimalPlaces,
      maximumFractionDigits: cur.decimalPlaces,
    })}`;

    return {
      amount: rounded,
      formatted,
      currency: cur,
    };
  }

  /**
   * Calculate exact import duties and local VAT/GST for transparent DDP (Delivered Duty Paid) shipping
   */
  static calculateDutyAndTax(amountUSD: number, destinationCountryCode: string): {
    dutyUSD: number;
    vatTaxUSD: number;
    totalTaxesUSD: number;
    isDDPCompliant: boolean;
    requiresPassport: boolean;
  } {
    const rule = TAX_DUTY_REGISTRY[destinationCountryCode.toUpperCase()] || {
      countryCode: destinationCountryCode,
      countryName: 'International',
      vatGstRate: 10.0,
      importDutyRate: 5.0,
      requiresPassportForCustoms: false,
    };

    const dutyUSD = parseFloat(((amountUSD * rule.importDutyRate) / 100).toFixed(2));
    const dutiableBase = amountUSD + dutyUSD;
    const vatTaxUSD = parseFloat(((dutiableBase * rule.vatGstRate) / 100).toFixed(2));
    const totalTaxesUSD = parseFloat((dutyUSD + vatTaxUSD).toFixed(2));

    return {
      dutyUSD,
      vatTaxUSD,
      totalTaxesUSD,
      isDDPCompliant: true,
      requiresPassport: rule.requiresPassportForCustoms,
    };
  }
}
