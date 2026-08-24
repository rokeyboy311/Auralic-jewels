import { 
  Product, 
  Category, 
  Collection, 
  Order, 
  User, 
  Review, 
  Coupon, 
  ShippingMethod, 
  BespokeInquiry,
  Conversation,
  ConversationMessage,
  AtelierStaff
} from './types';

// Centralized API Base URL
// In production on Vercel, NEXT_PUBLIC_API_URL points to the Render backend API (e.g. https://auralic-jewels.onrender.com)
// Automatically handles trailing slashes, missing /api prefix, and double slashes
export function getApiBaseUrl(): string {
  let envUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (envUrl) {
    envUrl = envUrl.trim().replace(/\/+$/, '');
    if (!envUrl.endsWith('/api')) {
      envUrl = `${envUrl}/api`;
    }
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  return '/api';
}

export interface ProductQueryParams {
  category?: string;
  collection?: string;
  metalType?: string;
  purity?: string;
  stoneType?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'best-seller';
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string; total?: number; page?: number; limit?: number }> {
  try {
    let url: string;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      const base = getApiBaseUrl().replace(/\/+$/, '');
      const cleanEndpoint = endpoint.replace(/^\/+/, '');
      url = `${base}/${cleanEndpoint}`;
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      credentials: 'include', // Automatically passes secure HttpOnly auralic_auth_token cookie
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `Request failed with status ${response.status}`,
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network communication error',
    };
  }
}

// Products API
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-solitaire-eternity-ring',
    name: 'The Celestial Solitaire Diamond Ring',
    slug: 'celestial-solitaire-diamond-ring',
    sku: 'AUR-RNG-001',
    brand: 'Maison Auralic',
    category: 'Rings',
    collection: 'Solitaire Masterpieces',
    gender: 'Women',
    shortDescription: 'A monumental 2.50ct Round Brilliant VVS1 Diamond cradled in signature 18K yellow gold 6-prong crown.',
    description: 'Sculpted in the heart of our Paris atelier, the Celestial Solitaire is the quintessential expression of timeless devotion. Hand-set with a GIA-certified 2.50-carat round brilliant-cut diamond of exceptional F colour and VVS1 clarity.',
    priceUSD: 12800,
    comparePriceUSD: 14200,
    currency: 'USD',
    metalType: 'Yellow Gold',
    purity: '18K',
    goldKarat: '18K Solid Gold',
    grossWeightGrams: 4.8,
    netGoldWeightGrams: 4.3,
    hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
    stoneType: 'Natural Diamond',
    stoneWeightCarats: 2.5,
    totalCaratWeight: 2.5,
    stock: 8,
    lowStockThreshold: 2,
    isReadyToShip: true,
    isMadeToOrder: false,
    isCustomizable: true,
    isEngravingAvailable: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 14,
    warrantyPeriodYears: 5,
    productionLeadTimeDays: 7,
    estimatedDispatchHours: 24,
    countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
    status: 'active',
    careInstructions: 'Clean gently with warm water, mild soap and a soft-bristle brush.',
    shippingInformation: 'Complimentary insured global delivery via Ferrari Group & FedEx Valuables.',
    returnEligibility: '30-Day Maison vault return privilege.',
    exchangeEligibility: 'Lifetime gold upgrade and diamond trade-in policy.',
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85', alt: 'The Celestial Solitaire Diamond Ring Front View', type: 'main', sortOrder: 1 },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=85', alt: 'The Celestial Solitaire Diamond Ring Angle Detail', type: 'gallery', sortOrder: 2 },
    ],
    variants: [
      { id: 'var-1', sku: 'AUR-RNG-001-YG-6', metalType: 'Yellow Gold', purity: '18K', size: 'US 6.0', priceUSD: 12800, stock: 4 },
      { id: 'var-2', sku: 'AUR-RNG-001-YG-7', metalType: 'Yellow Gold', purity: '18K', size: 'US 7.0', priceUSD: 12800, stock: 4 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-royal-emerald-necklace',
    name: 'The Empress Colombian Emerald Collar',
    slug: 'empress-colombian-emerald-collar',
    sku: 'AUR-NCK-002',
    brand: 'Maison Auralic',
    category: 'Necklaces',
    collection: 'The Royal Emerald Collection',
    gender: 'Women',
    shortDescription: 'Rare 8.40ct untreated Muzo emerald flanked by graduated baguette-cut diamond cascades in 18K white gold.',
    description: 'An extraordinary creation featuring a royal Colombian emerald of intense saturated green hue, harvested from the legendary Muzo mines and certified with no indications of oil treatment.',
    priceUSD: 38500,
    comparePriceUSD: 42000,
    currency: 'USD',
    metalType: 'White Gold',
    purity: '18K',
    goldKarat: '18K Solid Gold',
    grossWeightGrams: 32.5,
    netGoldWeightGrams: 30.8,
    hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
    stoneType: 'Emerald',
    stoneWeightCarats: 12.8,
    totalCaratWeight: 12.8,
    stock: 2,
    lowStockThreshold: 1,
    isReadyToShip: true,
    isMadeToOrder: false,
    isCustomizable: true,
    isEngravingAvailable: false,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 6,
    warrantyPeriodYears: 5,
    productionLeadTimeDays: 14,
    estimatedDispatchHours: 24,
    countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
    status: 'active',
    careInstructions: 'Avoid steam and ultrasound cleaning. Wipe with a dry microfiber cloth.',
    shippingInformation: 'Hand-delivered with armored concierge escrow.',
    returnEligibility: '30-Day Maison vault return privilege.',
    exchangeEligibility: 'Lifetime gold upgrade warranty.',
    images: [
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85', alt: 'The Empress Colombian Emerald Collar', type: 'main', sortOrder: 1 },
      { id: 'img-4', url: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1200&q=85', alt: 'The Empress Colombian Emerald Close Up', type: 'gallery', sortOrder: 2 },
    ],
    variants: [
      { id: 'var-3', sku: 'AUR-NCK-002-WG-18', metalType: 'White Gold', purity: '18K', size: '18 inch', priceUSD: 38500, stock: 2 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-heritage-solid-bangle',
    name: 'The Heritage 22K Hand-Carved Sovereign Bangle',
    slug: 'heritage-22k-hand-carved-sovereign-bangle',
    sku: 'AUR-BNG-003',
    brand: 'Maison Auralic',
    category: 'Bangles',
    collection: 'Heritage 22K Solid Gold',
    gender: 'Women',
    shortDescription: 'Solid 22K rich bullion gold rigid bangle featuring hand-chiselled archival scrollwork.',
    description: 'Crafted from substantial 22-karat sovereign bullion gold, this heirloom bangle pays homage to centuries of goldsmithing mastery. Weighted for sublime tactile luxury with a discreet safety clasp.',
    priceUSD: 8900,
    comparePriceUSD: 9500,
    currency: 'USD',
    metalType: 'Yellow Gold',
    purity: '22K',
    goldKarat: '22K Solid Gold',
    grossWeightGrams: 46.2,
    netGoldWeightGrams: 46.2,
    hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
    stoneType: 'None',
    stoneWeightCarats: 0,
    totalCaratWeight: 0,
    stock: 5,
    lowStockThreshold: 1,
    isReadyToShip: true,
    isMadeToOrder: false,
    isCustomizable: true,
    isEngravingAvailable: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.9,
    reviewCount: 9,
    warrantyPeriodYears: 5,
    productionLeadTimeDays: 7,
    estimatedDispatchHours: 24,
    countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
    status: 'active',
    careInstructions: 'Clean gently with warm water and soft polishing cloth.',
    shippingInformation: 'Complimentary insured worldwide armored delivery.',
    returnEligibility: '30-Day Maison vault return privilege.',
    exchangeEligibility: 'Guaranteed 100% gold purity value exchange.',
    images: [
      { id: 'img-5', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85', alt: 'The Heritage 22K Hand-Carved Sovereign Bangle', type: 'main', sortOrder: 1 },
    ],
    variants: [
      { id: 'var-4', sku: 'AUR-BNG-003-YG-S', metalType: 'Yellow Gold', purity: '22K', size: 'Medium (60mm)', priceUSD: 8900, stock: 5 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-diamond-tennis-bracelet',
    name: 'The Luminescence 8.00ct Diamond Tennis Bracelet',
    slug: 'luminescence-8ct-diamond-tennis-bracelet',
    sku: 'AUR-BRC-004',
    brand: 'Maison Auralic',
    category: 'Bracelets',
    collection: 'Solitaire Masterpieces',
    gender: 'Women',
    shortDescription: 'A continuous rivière line of 48 calibrated Ideal Cut diamonds set in flexible 18K platinum-gold prongs.',
    description: 'An essential high jewellery icon. Each diamond is individually microscope-matched for identical diameter, colour grade, and table reflection to create an unbroken river of liquid brilliance.',
    priceUSD: 16500,
    comparePriceUSD: 18000,
    currency: 'USD',
    metalType: 'White Gold',
    purity: '18K',
    goldKarat: '18K Solid Gold',
    grossWeightGrams: 14.2,
    netGoldWeightGrams: 12.6,
    hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
    stoneType: 'Natural Diamond',
    stoneWeightCarats: 8.0,
    totalCaratWeight: 8.0,
    stock: 6,
    lowStockThreshold: 2,
    isReadyToShip: true,
    isMadeToOrder: false,
    isCustomizable: true,
    isEngravingAvailable: true,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 22,
    warrantyPeriodYears: 5,
    productionLeadTimeDays: 5,
    estimatedDispatchHours: 24,
    countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
    status: 'active',
    careInstructions: 'Clean gently with ultrasonic jewellery cleaner or soft cloth.',
    shippingInformation: 'Complimentary insured worldwide armored delivery.',
    returnEligibility: '30-Day Maison vault return privilege.',
    exchangeEligibility: 'Lifetime gold upgrade warranty.',
    images: [
      { id: 'img-6', url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1200&q=85', alt: 'The Luminescence 8.00ct Diamond Tennis Bracelet', type: 'main', sortOrder: 1 },
    ],
    variants: [
      { id: 'var-5', sku: 'AUR-BRC-004-WG-7', metalType: 'White Gold', purity: '18K', size: '7.0 inch', priceUSD: 16500, stock: 6 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-sapphire-chandeliers',
    name: 'The Royal Ceylon Sapphire Cascade Earrings',
    slug: 'royal-ceylon-sapphire-cascade-earrings',
    sku: 'AUR-EAR-005',
    brand: 'Maison Auralic',
    category: 'Earrings',
    collection: 'The Royal Emerald Collection',
    gender: 'Women',
    shortDescription: 'Pair of royal blue natural unheated Ceylon sapphires suspended below pavé diamond halos in 18K white gold.',
    description: 'Evoking the majestic glamour of Paris ballrooms, these dramatic drops showcase twin unheated Ceylon sapphires totaling 6.20 carats, swaying gracefully with every movement.',
    priceUSD: 19400,
    comparePriceUSD: 21500,
    currency: 'USD',
    metalType: 'White Gold',
    purity: '18K',
    goldKarat: '18K Solid Gold',
    grossWeightGrams: 11.6,
    netGoldWeightGrams: 9.8,
    hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
    stoneType: 'Sapphire',
    stoneWeightCarats: 7.8,
    totalCaratWeight: 7.8,
    stock: 3,
    lowStockThreshold: 1,
    isReadyToShip: true,
    isMadeToOrder: false,
    isCustomizable: true,
    isEngravingAvailable: false,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 11,
    warrantyPeriodYears: 5,
    productionLeadTimeDays: 7,
    estimatedDispatchHours: 24,
    countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
    status: 'active',
    careInstructions: 'Wipe with soft lint-free cloth and store in separate velvet pouch.',
    shippingInformation: 'Complimentary insured worldwide armored delivery.',
    returnEligibility: '30-Day Maison vault return privilege.',
    exchangeEligibility: 'Lifetime gold upgrade warranty.',
    images: [
      { id: 'img-7', url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=85', alt: 'The Royal Ceylon Sapphire Cascade Earrings', type: 'main', sortOrder: 1 },
    ],
    variants: [
      { id: 'var-6', sku: 'AUR-EAR-005-WG', metalType: 'White Gold', purity: '18K', size: 'Drop (38mm)', priceUSD: 19400, stock: 3 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-mens-signet-cufflinks',
    name: 'The Sovereign Onyx & Diamond Signet Ring',
    slug: 'sovereign-onyx-diamond-signet-ring',
    sku: 'AUR-MNS-006',
    brand: 'Maison Auralic',
    category: "Men's Jewellery",
    collection: 'Heritage 22K Solid Gold',
    gender: 'Men',
    shortDescription: 'Substantial architectural signet in satin-brushed 18K yellow gold with natural black onyx and central diamond star.',
    description: 'A commanding masculine emblem combining razor-sharp modernist geometry with old-world weight. The central bezel holds a calibrated princess cut diamond flush-set in midnight onyx.',
    priceUSD: 6200,
    comparePriceUSD: 6800,
    currency: 'USD',
    metalType: 'Yellow Gold',
    purity: '18K',
    goldKarat: '18K Solid Gold',
    grossWeightGrams: 19.5,
    netGoldWeightGrams: 18.0,
    hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
    stoneType: 'Natural Diamond',
    stoneWeightCarats: 0.65,
    totalCaratWeight: 0.65,
    stock: 10,
    lowStockThreshold: 2,
    isReadyToShip: true,
    isMadeToOrder: false,
    isCustomizable: true,
    isEngravingAvailable: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 5.0,
    reviewCount: 7,
    warrantyPeriodYears: 5,
    productionLeadTimeDays: 7,
    estimatedDispatchHours: 24,
    countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
    status: 'active',
    careInstructions: 'Clean gently with warm soapy water and dry thoroughly.',
    shippingInformation: 'Complimentary insured worldwide armored delivery.',
    returnEligibility: '30-Day Maison vault return privilege.',
    exchangeEligibility: 'Lifetime gold upgrade warranty.',
    images: [
      { id: 'img-8', url: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=1200&q=85', alt: 'The Sovereign Onyx & Diamond Signet Ring', type: 'main', sortOrder: 1 },
    ],
    variants: [
      { id: 'var-7', sku: 'AUR-MNS-006-YG-10', metalType: 'Yellow Gold', purity: '18K', size: 'US 10.0', priceUSD: 6200, stock: 10 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-diamond-pave-band',
    name: 'Place Vendôme Diamond Pavé Eternity Ring',
    slug: 'place-vendome-diamond-pave-eternity-ring',
    sku: 'AUR-RNG-007',
    brand: 'Maison Auralic',
    category: 'Rings',
    collection: 'Solitaire Masterpieces',
    gender: 'Women',
    shortDescription: 'Full 360-degree micro-pavé band featuring triple rows of flawless round brilliant diamonds in 18K rose gold.',
    description: 'An architectural tribute to the grandeur of Place Vendôme. Triple rows of microscope-set brilliant cut diamonds wrap endlessly around the finger in warm 18K rose gold.',
    priceUSD: 7400,
    comparePriceUSD: 8200,
    currency: 'USD',
    metalType: 'Rose Gold',
    purity: '18K',
    goldKarat: '18K Solid Gold',
    grossWeightGrams: 5.2,
    netGoldWeightGrams: 4.4,
    hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
    stoneType: 'Natural Diamond',
    stoneWeightCarats: 1.85,
    totalCaratWeight: 1.85,
    stock: 7,
    lowStockThreshold: 2,
    isReadyToShip: true,
    isMadeToOrder: false,
    isCustomizable: true,
    isEngravingAvailable: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 18,
    warrantyPeriodYears: 5,
    productionLeadTimeDays: 7,
    estimatedDispatchHours: 24,
    countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
    status: 'active',
    careInstructions: 'Clean gently with warm water and soft cloth.',
    shippingInformation: 'Complimentary insured worldwide delivery.',
    returnEligibility: '30-Day Maison vault return privilege.',
    exchangeEligibility: 'Lifetime gold upgrade warranty.',
    images: [
      { id: 'img-9', url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=85', alt: 'Place Vendôme Diamond Pavé Eternity Ring', type: 'main', sortOrder: 1 },
    ],
    variants: [
      { id: 'var-8', sku: 'AUR-RNG-007-RG-6', metalType: 'Rose Gold', purity: '18K', size: 'US 6.0', priceUSD: 7400, stock: 7 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-riviera-yellow-diamond-pendant',
    name: 'The Riviera Fancy Intense Yellow Diamond Pendant',
    slug: 'riviera-fancy-yellow-diamond-pendant',
    sku: 'AUR-PND-008',
    brand: 'Maison Auralic',
    category: 'Pendants',
    collection: 'Solitaire Masterpieces',
    gender: 'Women',
    shortDescription: 'Cushion-cut 3.20ct Fancy Intense Yellow Diamond framed in a double halo of collection white diamonds.',
    description: 'Radiating the warmth of the French Riviera sun, this one-of-a-kind pendant showcases a certified Fancy Intense Yellow diamond of breathtaking saturation, set in dual 18K yellow and white gold.',
    priceUSD: 24800,
    comparePriceUSD: 27500,
    currency: 'USD',
    metalType: 'Yellow Gold',
    purity: '18K',
    goldKarat: '18K Solid Gold',
    grossWeightGrams: 8.9,
    netGoldWeightGrams: 7.8,
    hallmarkAssayOffice: 'Paris Place Vendôme Assay Stamp',
    stoneType: 'Natural Diamond',
    stoneWeightCarats: 4.4,
    totalCaratWeight: 4.4,
    stock: 2,
    lowStockThreshold: 1,
    isReadyToShip: true,
    isMadeToOrder: false,
    isCustomizable: true,
    isEngravingAvailable: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 8,
    warrantyPeriodYears: 5,
    productionLeadTimeDays: 7,
    estimatedDispatchHours: 24,
    countryOfOrigin: 'France (Paris Place Vendôme Atelier)',
    status: 'active',
    careInstructions: 'Clean with delicate diamond cleaner and microfiber towel.',
    shippingInformation: 'Complimentary insured worldwide armored delivery.',
    returnEligibility: '30-Day Maison vault return privilege.',
    exchangeEligibility: 'Lifetime gold upgrade warranty.',
    images: [
      { id: 'img-10', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85', alt: 'The Riviera Fancy Intense Yellow Diamond Pendant', type: 'main', sortOrder: 1 },
    ],
    variants: [
      { id: 'var-9', sku: 'AUR-PND-008-YG', metalType: 'Yellow Gold', purity: '18K', size: 'Standard (18 inch chain included)', priceUSD: 24800, stock: 2 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function getProducts(params: ProductQueryParams = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.collection) query.set('collection', params.collection);
  if (params.metalType) query.set('metalType', params.metalType);
  if (params.purity) query.set('purity', params.purity);
  if (params.stoneType) query.set('stoneType', params.stoneType);
  if (params.gender) query.set('gender', params.gender);
  if (params.minPrice) query.set('minPrice', params.minPrice.toString());
  if (params.maxPrice) query.set('maxPrice', params.maxPrice.toString());
  if (params.sort) query.set('sort', params.sort);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const qs = query.toString();
  const res = await fetchApi<Product[]>(`/products${qs ? `?${qs}` : ''}`);

  if (res.success && res.data && res.data.length > 0) {
    // Ensure all products have the boolean flags correctly populated
    const enriched = res.data.map(p => ({
      ...p,
      isFeatured: p.isFeatured ?? true,
      isNewArrival: p.isNewArrival ?? true,
      isBestSeller: p.isBestSeller ?? (p as any).isBestseller ?? true,
      images: p.images && p.images.length > 0 ? p.images : [
        { id: 'img-fb', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85', alt: p.name, type: 'main' as const, sortOrder: 1 }
      ]
    }));
    return { ...res, data: enriched };
  }

  // Filter fallback products by criteria if provided
  let filtered = [...FALLBACK_PRODUCTS];
  if (params.category) {
    const catLower = params.category.toLowerCase().replace(/^cat-/, '');
    filtered = filtered.filter(p => p.category.toLowerCase().includes(catLower) || (p as any).category_id?.toLowerCase().includes(catLower));
  }
  if (params.collection) {
    const colLower = params.collection.toLowerCase().replace(/^col-/, '');
    filtered = filtered.filter(p => p.collection.toLowerCase().includes(colLower));
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  return { success: true, data: filtered.length > 0 ? filtered : FALLBACK_PRODUCTS };
}

export async function getProduct(slugOrId: string) {
  const res = await fetchApi<Product>(`/products/${encodeURIComponent(slugOrId)}`);
  if (res.success && res.data) {
    return res;
  }
  const fallback = FALLBACK_PRODUCTS.find(p => p.slug === slugOrId || p.id === slugOrId);
  if (fallback) {
    return { success: true, data: fallback };
  }
  return res;
}

export async function getProductBySlug(slug: string) {
  return await getProduct(slug);
}

// Curated Categories with high-resolution imagery
export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'cat-rings',
    name: 'Rings',
    slug: 'rings',
    description: 'Solitaires, pavé eternity bands, and sculptural cocktail rings in 18K and 22K gold.',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
    itemCount: 24,
  },
  {
    id: 'cat-necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'High jewellery diamond collars, tennis necklaces, and gemstone chokers.',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
    itemCount: 18,
  },
  {
    id: 'cat-earrings',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Brilliant cut diamond studs, celestial chandeliers, and emerald drops.',
    imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80',
    itemCount: 16,
  },
  {
    id: 'cat-bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Iconic tennis bracelets, diamond line cuffs, and gold link creations.',
    imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80',
    itemCount: 14,
  },
  {
    id: 'cat-bangles',
    name: 'Bangles',
    slug: 'bangles',
    description: 'Solid 18K & 22K gold rigid bangles with intricate filigree and hidden diamond hinges.',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
    itemCount: 12,
  },
  {
    id: 'cat-pendants',
    name: 'Pendants',
    slug: 'pendants',
    description: 'Symbolic talismans, bezel-set certified solitaires, and architectural medallions.',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80',
    itemCount: 15,
  },
  {
    id: 'cat-chains',
    name: 'Chains',
    slug: 'chains',
    description: 'Heavy curb, wheat, rope, and box chains hand-spun in solid 18K yellow and rose gold.',
    imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80',
    itemCount: 9,
  },
  {
    id: 'cat-mens',
    name: "Men's Jewellery",
    slug: 'mens-jewellery',
    description: 'Architectural signet rings, solid platinum cuff links, and heavy diamond link bands.',
    imageUrl: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=1000&q=80',
    itemCount: 11,
  },
  {
    id: 'cat-womens',
    name: "Women's Jewellery",
    slug: 'womens-jewellery',
    description: 'Elegantly proportioned feminine creations capturing eternal light.',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80',
    itemCount: 42,
  },
  {
    id: 'cat-custom',
    name: 'Custom Jewellery',
    slug: 'custom-jewellery',
    description: 'Bespoke commissions designed alongside our Master Gemologists.',
    imageUrl: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1000&q=80',
    itemCount: 6,
  }
];

export const FALLBACK_COLLECTIONS: Collection[] = [
  {
    id: 'col-solitaire-masterpieces',
    name: 'Solitaire Masterpieces',
    slug: 'solitaire-masterpieces',
    subtitle: 'Exceptional GIA Certified Diamonds in Iconic Auralic Prongs',
    description: 'A celebration of pure brilliance. Each diamond is hand-selected for its extraordinary fire and cut.',
    bannerImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=85',
    itemCount: 12,
  },
  {
    id: 'col-royal-emerald',
    name: 'The Royal Emerald Collection',
    slug: 'royal-emerald',
    subtitle: 'Colombian Muzo Emeralds Paired with Brilliant Cut Diamonds',
    description: 'Deep verdant greens reflecting ancient royalty, framed by sculptural 18K yellow gold.',
    bannerImage: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1800&q=85',
    itemCount: 8,
  },
  {
    id: 'col-heritage-gold',
    name: 'Heritage 22K Solid Gold',
    slug: 'heritage-gold',
    subtitle: 'Pure Radiance Hand-Carved by Master Goldsmiths',
    description: 'Rich, lustrous 22K gold forged with timeless textures and substantial weight.',
    bannerImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1800&q=85',
    itemCount: 10,
  }
];

// Categories & Collections
export async function getCategories() {
  const res = await fetchApi<Category[]>('/categories');
  if (res.success && res.data && res.data.length > 0) {
    // Ensure all category items have imageUrl populated
    const enriched = res.data.map(cat => {
      const fb = FALLBACK_CATEGORIES.find(f => f.slug === cat.slug || f.id === cat.id);
      const img = cat.imageUrl || (cat as any).image || (cat as any).image_url || fb?.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80';
      return {
        ...cat,
        imageUrl: img,
        itemCount: cat.itemCount || fb?.itemCount || 12,
      };
    });
    return { ...res, data: enriched };
  }
  return { success: true, data: FALLBACK_CATEGORIES };
}

export async function getCollections() {
  const res = await fetchApi<Collection[]>('/collections');
  if (res.success && res.data && res.data.length > 0) {
    const enriched = res.data.map(col => {
      const fb = FALLBACK_COLLECTIONS.find(f => f.slug === col.slug || f.id === col.id);
      const img = col.bannerImage || (col as any).heroImage || (col as any).imageUrl || fb?.bannerImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=85';
      return {
        ...col,
        bannerImage: img,
        subtitle: col.subtitle || fb?.subtitle || 'Haute Joaillerie',
      };
    });
    return { ...res, data: enriched };
  }
  return { success: true, data: FALLBACK_COLLECTIONS };
}

// Coupon / Promotion Validation
export async function validateCoupon(code: string, orderSubtotalUSD: number) {
  return await fetchApi<{ coupon: Coupon; discountUSD: number }>('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, orderSubtotalUSD }),
  });
}

// Shipping Methods
export async function getShippingMethods() {
  return await fetchApi<ShippingMethod[]>('/shipping');
}

// Orders & Checkout
export async function createPaymentIntent(amountUSD: number, currency: string = 'USD', orderId?: string) {
  return await fetchApi<{ clientSecret: string; paymentIntentId: string }>('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ amountUSD, currency, orderId }),
  });
}

export async function createOrder(orderPayload: Partial<Order>) {
  return await fetchApi<{ order: Order; clientSecret?: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
}

export async function getMyOrders() {
  return await fetchApi<Order[]>('/orders/my');
}

export async function getOrder(id: string) {
  return await fetchApi<Order>(`/orders/${encodeURIComponent(id)}`);
}

export async function trackOrder(orderNumber: string, email: string) {
  return await fetchApi<any>('/orders/track', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, email }),
  });
}

// Auth API
export async function loginUser(email: string, password?: string) {
  return await fetchApi<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(userData: { name: string; email: string; password?: string; phone?: string }) {
  return await fetchApi<{ user: User; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function loginWithGoogle(payload?: { credential?: string; idToken?: string; email?: string; name?: string }) {
  return await fetchApi<{ user: User; token: string }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export async function getCurrentUserProfile() {
  return await fetchApi<User>('/auth/me');
}

export async function logoutUser() {
  return await fetchApi<{ success: boolean }>('/auth/logout', { method: 'POST' });
}

export async function requestPasswordReset(email: string) {
  return await fetchApi<{ success: boolean; message: string }>('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function executePasswordReset(token: string, newPassword: string) {
  return await fetchApi<{ success: boolean; message: string }>('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

// Media Upload via Neon Database Image Vault
export async function uploadImage(file: File, folder: string = 'auralic_jewels') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetchApi<{ url: string; id: string; format: string; bytes: number }>('/uploads/image', {
    method: 'POST',
    body: formData,
  });

  if (res.success && res.data?.url && res.data.url.startsWith('/api/')) {
    const base = getApiBaseUrl().replace(/\/api\/?$/, '');
    if (base && !res.data.url.startsWith('http')) {
      res.data.url = `${base}${res.data.url}`;
    }
  }

  return res;
}

// Reviews
export async function getProductReviews(productId: string) {
  return await fetchApi<Review[]>(`/reviews?productId=${encodeURIComponent(productId)}`);
}

export async function submitProductReview(review: {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  userCountry?: string;
}) {
  return await fetchApi<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

// Bespoke Custom Inquiries
export async function submitBespokeInquiry(inquiry: Omit<BespokeInquiry, 'id' | 'referenceNumber' | 'status' | 'createdAt'>) {
  return await fetchApi<BespokeInquiry>('/bespoke', {
    method: 'POST',
    body: JSON.stringify(inquiry),
  });
}

export async function getBespokeInquiries() {
  return await fetchApi<BespokeInquiry[]>('/bespoke');
}

// Contact & Newsletter
export async function submitContactInquiry(inquiry: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  boutiqueLocation?: string;
}) {
  return await fetchApi<{ success: boolean; message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(inquiry),
  });
}

export async function subscribeNewsletter(email: string) {
  return await fetchApi<{ success: boolean; message: string }>('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// Admin API
export async function getAdminStats() {
  return await fetchApi<any>('/admin/stats');
}

export async function getAdminOrders() {
  return await fetchApi<Order[]>('/admin/orders');
}

export async function updateAdminOrderStatus(orderId: string, status: string, trackingNumber?: string, carrierName?: string, note?: string) {
  return await fetchApi<Order>(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, trackingNumber, carrierName, note }),
  });
}

export const updateOrderStatus = updateAdminOrderStatus;

export async function saveProduct(product: Partial<Product>) {
  return await fetchApi<Product>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export const saveAdminProduct = saveProduct;

export async function deleteProduct(productId: string) {
  return await fetchApi<{ id: string }>(`/admin/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export const deleteAdminProduct = deleteProduct;

// Conversations & Atelier Chat API
export async function getConversations(params: { status?: string; priority?: string; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.priority) query.set('priority', params.priority);
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return await fetchApi<Conversation[]>(`/conversations${qs ? `?${qs}` : ''}`);
}

export async function getConversation(id: string) {
  return await fetchApi<Conversation>(`/conversations/${encodeURIComponent(id)}`);
}

export async function createConversation(payload: {
  subject: string;
  type?: string;
  priority?: string;
  initialMessage: string;
  productId?: string;
  productContext?: any;
  orderId?: string;
  orderContext?: any;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}) {
  return await fetchApi<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendConversationMessage(
  conversationId: string,
  payload: {
    content: string;
    attachments?: any[];
    isInternalNote?: boolean;
    senderRole?: string;
    senderName?: string;
  }
) {
  return await fetchApi<{ message: ConversationMessage; conversation?: Conversation }>(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function updateConversation(
  conversationId: string,
  payload: {
    status?: string;
    priority?: string;
    assignedStaffId?: string;
    assignedStaffName?: string;
    internalNotes?: string;
  }
) {
  return await fetchApi<Conversation>(`/conversations/${encodeURIComponent(conversationId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getStaffDirectory() {
  return await fetchApi<AtelierStaff[]>('/admin/staff');
}
