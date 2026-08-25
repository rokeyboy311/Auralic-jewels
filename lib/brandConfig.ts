export interface BrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  subTagline: string;
  foundedYear: number;
  founder: string;
  headquarters: string;
  supportEmail: string;
  conciergeEmail: string;
  pressEmail: string;
  phone: string;
  conciergeWhatsApp: string;
  socials: {
    instagram: string;
    pinterest: string;
    facebook: string;
    youtube: string;
  };
  boutiques: Array<{
    city: string;
    address: string;
    phone: string;
    hours: string;
    image: string;
  }>;
  currencies: Array<{
    code: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'AUD' | 'CAD';
    symbol: string;
    name: string;
    rateFromUSD: number; // exchange multiplier
    taxInclusive: boolean;
    defaultTaxRate: number; // e.g. 0.08 for 8%
  }>;
  freeShippingThresholdUSD: number;
  returnPolicyDays: number;
  warrantyYears: number;
}

export const brandConfig: BrandConfig = {
  name: 'AURELIC FINE JEWELLERY',
  shortName: 'AURELIC',
  tagline: 'Haute Joaillerie & High Fine Jewellery',
  subTagline: 'Handcrafted heirlooms, certified conflict-free diamonds, and timeless bespoke gold artistry.',
  foundedYear: 1988,
  founder: 'Aurelic Jewels Artisans',
  headquarters: '12 Place Vendôme, 75001 Paris, France',
  supportEmail: 'care@aurelic-jewels.vercel.app',
  conciergeEmail: 'concierge@aurelic-jewels.vercel.app',
  pressEmail: 'press@aurelic-jewels.vercel.app',
  phone: '+1 (800) 842-8930',
  conciergeWhatsApp: '+33 1 42 68 00 00',
  socials: {
    instagram: 'https://instagram.com/aurelic.finejewellery',
    pinterest: 'https://pinterest.com/aurelicjewels',
    facebook: 'https://facebook.com/aurelicjewels',
    youtube: 'https://youtube.com/aurelicjewellery',
  },
  boutiques: [
    {
      city: 'Paris',
      address: '12 Place Vendôme, 75001 Paris, France',
      phone: '+33 1 42 68 00 00',
      hours: 'Mon – Sat: 10:30 – 19:30',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'New York',
      address: '740 Madison Avenue, New York, NY 10065',
      phone: '+1 (212) 555-0198',
      hours: 'Mon – Sat: 10:00 – 19:00, Sun: 12:00 – 17:00',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'London',
      address: '44 Old Bond Street, Mayfair, London W1S 4QR',
      phone: '+44 20 7946 0912',
      hours: 'Mon – Sat: 10:00 – 18:30',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Dubai',
      address: 'Fashion Avenue, The Dubai Mall, Downtown Dubai',
      phone: '+971 4 362 7500',
      hours: 'Daily: 10:00 – 23:00',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    },
  ],
  currencies: [
    { code: 'USD', symbol: '$', name: 'US Dollar', rateFromUSD: 1.0, taxInclusive: false, defaultTaxRate: 0.07 },
    { code: 'EUR', symbol: '€', name: 'Euro', rateFromUSD: 0.92, taxInclusive: true, defaultTaxRate: 0.20 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rateFromUSD: 0.79, taxInclusive: true, defaultTaxRate: 0.20 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromUSD: 86.5, taxInclusive: true, defaultTaxRate: 0.03 },
    { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rateFromUSD: 3.67, taxInclusive: true, defaultTaxRate: 0.05 },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromUSD: 1.54, taxInclusive: true, defaultTaxRate: 0.10 },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateFromUSD: 1.38, taxInclusive: false, defaultTaxRate: 0.13 },
  ],
  freeShippingThresholdUSD: 500,
  returnPolicyDays: 30,
  warrantyYears: 5,
};
