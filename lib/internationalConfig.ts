import { ShippingMethodOption, CurrencyCode } from './types';

export interface CountryInfo {
  code: string;
  name: string;
  currency: CurrencyCode;
  callingCode: string;
  vatRatePercent: number;
  dutyRatePercent: number;
  taxName: string;
  isTaxIncludedInPrice: boolean;
  dutyThresholdUSD: number;
}

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    callingCode: '+1',
    vatRatePercent: 7.0, // State sales tax avg
    dutyRatePercent: 0.0,
    taxName: 'State Sales Tax',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 2500,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    callingCode: '+44',
    vatRatePercent: 20.0,
    dutyRatePercent: 2.5,
    taxName: 'UK VAT',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 175,
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    callingCode: '+33',
    vatRatePercent: 20.0,
    dutyRatePercent: 2.5,
    taxName: 'TVA',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 150,
  },
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    callingCode: '+49',
    vatRatePercent: 19.0,
    dutyRatePercent: 2.5,
    taxName: 'MwSt',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 150,
  },
  {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    callingCode: '+39',
    vatRatePercent: 22.0,
    dutyRatePercent: 2.5,
    taxName: 'IVA',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 150,
  },
  {
    code: 'CH',
    name: 'Switzerland',
    currency: 'CHF',
    callingCode: '+41',
    vatRatePercent: 8.1,
    dutyRatePercent: 0.0,
    taxName: 'Swiss VAT',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 300,
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    callingCode: '+971',
    vatRatePercent: 5.0,
    dutyRatePercent: 0.0,
    taxName: 'UAE VAT',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 1000,
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    callingCode: '+91',
    vatRatePercent: 3.0,
    dutyRatePercent: 0.0,
    taxName: 'GST (Gold & Gems)',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 1000,
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    callingCode: '+61',
    vatRatePercent: 10.0,
    dutyRatePercent: 5.0,
    taxName: 'GST',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 1000,
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    callingCode: '+1',
    vatRatePercent: 13.0,
    dutyRatePercent: 4.5,
    taxName: 'HST / GST',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 200,
  },
  {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    callingCode: '+65',
    vatRatePercent: 9.0,
    dutyRatePercent: 0.0,
    taxName: 'GST',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 400,
  },
  {
    code: 'JP',
    name: 'Japan',
    currency: 'USD',
    callingCode: '+81',
    vatRatePercent: 10.0,
    dutyRatePercent: 3.0,
    taxName: 'Consumption Tax',
    isTaxIncludedInPrice: false,
    dutyThresholdUSD: 150,
  },
];

export const ARMORED_SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    id: 'ship-ferrari-valuable',
    name: 'Ferrari Group International Valuables Courier',
    carrier: 'Ferrari Group Valuables',
    description: 'Armored direct custody, 100% insured with Lloyd’s of London, adult ID required upon hand-delivery.',
    costUSD: 0, // Free above luxury threshold
    estimatedDays: '2 - 4 Business Days',
    isFreeAboveThreshold: true,
    insuranceIncluded: true,
    requiresSignature: true,
  },
  {
    id: 'ship-malca-amit-secure',
    name: 'Malca-Amit Ultra-Secure Priority Dispatch',
    carrier: 'Malca-Amit Security',
    description: 'Dedicated armored escort from Paris Place Vendôme workshop directly to your private residence or private bank vault.',
    costUSD: 150,
    estimatedDays: '1 - 3 Business Days Priority',
    isFreeAboveThreshold: false,
    insuranceIncluded: true,
    requiresSignature: true,
  },
  {
    id: 'ship-dhl-highvalue',
    name: 'DHL Express Insured Precision Air',
    carrier: 'DHL Express High Value',
    description: 'Tracked priority express aircraft transport in tamper-sealed security enclosure.',
    costUSD: 45,
    estimatedDays: '3 - 5 Business Days',
    isFreeAboveThreshold: true,
    insuranceIncluded: true,
    requiresSignature: true,
  },
];

export interface RingSizeConversion {
  us: string;
  uk: string;
  eu: string;
  japan: string;
  circumferenceMm: number;
  diameterMm: number;
}

export const RING_SIZE_CHART: RingSizeConversion[] = [
  { us: 'US 4.0', uk: 'H', eu: '47', japan: '7', circumferenceMm: 46.8, diameterMm: 14.9 },
  { us: 'US 4.5', uk: 'I', eu: '48', japan: '8', circumferenceMm: 48.0, diameterMm: 15.3 },
  { us: 'US 5.0', uk: 'J 1/2', eu: '49.5', japan: '9', circumferenceMm: 49.3, diameterMm: 15.7 },
  { us: 'US 5.5', uk: 'L', eu: '51', japan: '10', circumferenceMm: 50.6, diameterMm: 16.1 },
  { us: 'US 6.0', uk: 'M', eu: '52', japan: '11', circumferenceMm: 51.9, diameterMm: 16.5 },
  { us: 'US 6.5', uk: 'N', eu: '53.5', japan: '13', circumferenceMm: 53.1, diameterMm: 16.9 },
  { us: 'US 7.0', uk: 'O', eu: '54.5', japan: '14', circumferenceMm: 54.4, diameterMm: 17.3 },
  { us: 'US 7.5', uk: 'P', eu: '56', japan: '15', circumferenceMm: 55.7, diameterMm: 17.7 },
  { us: 'US 8.0', uk: 'Q', eu: '57', japan: '16', circumferenceMm: 57.0, diameterMm: 18.1 },
  { us: 'US 8.5', uk: 'Q 1/2', eu: '58.5', japan: '17', circumferenceMm: 58.3, diameterMm: 18.5 },
  { us: 'US 9.0', uk: 'R 1/2', eu: '60', japan: '18', circumferenceMm: 59.5, diameterMm: 18.9 },
  { us: 'US 9.5', uk: 'S 1/2', eu: '61', japan: '19', circumferenceMm: 60.8, diameterMm: 19.4 },
  { us: 'US 10.0', uk: 'T 1/2', eu: '62.5', japan: '20', circumferenceMm: 62.1, diameterMm: 19.8 },
];

export function calculateInternationalDutyAndTax(
  subtotalUSD: number,
  destinationCountryCode: string
): {
  country: CountryInfo;
  taxAmountUSD: number;
  dutyAmountUSD: number;
  effectiveRateSummary: string;
} {
  const country = SUPPORTED_COUNTRIES.find((c) => c.code === destinationCountryCode) || SUPPORTED_COUNTRIES[0];
  
  // Tax calculation rounded to 2 decimal places
  const taxAmountUSD = Math.round(((subtotalUSD * country.vatRatePercent) / 100) * 100) / 100;
  
  // Duty calculation if subtotal exceeds threshold
  let dutyAmountUSD = 0;
  if (subtotalUSD > country.dutyThresholdUSD && country.dutyRatePercent > 0) {
    dutyAmountUSD = Math.round(((subtotalUSD * country.dutyRatePercent) / 100) * 100) / 100;
  }

  const effectiveRateSummary = `${country.taxName} (${country.vatRatePercent}%)${
    dutyAmountUSD > 0 ? ` + Customs Duty (${country.dutyRatePercent}%)` : ''
  }`;

  return {
    country,
    taxAmountUSD,
    dutyAmountUSD,
    effectiveRateSummary,
  };
}
