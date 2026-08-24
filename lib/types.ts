export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'AUD' | 'CAD' | 'CHF' | 'SGD';

export type MetalType = 'Yellow Gold' | 'White Gold' | 'Rose Gold' | 'Platinum' | 'Sterling Silver' | 'Two-Tone Gold';
export type GoldPurity = '14K' | '18K' | '22K' | '24K' | '950 Platinum' | '925 Sterling Silver';
export type StoneType = 'Natural Diamond' | 'Lab Diamond' | 'Emerald' | 'Sapphire' | 'Ruby' | 'South Sea Pearl' | 'None';
export type DiamondShape = 'Round Brilliant' | 'Princess' | 'Cushion' | 'Emerald Cut' | 'Oval' | 'Pear' | 'Radiant' | 'Marquise' | 'Asscher';
export type DiamondColor = 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'Fancy Vivid';
export type DiamondClarity = 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1';
export type DiamondCut = 'Ideal' | 'Excellent' | 'Very Good' | 'Good';
export type Gender = 'Women' | 'Men' | 'Unisex';

export type ProductCategory = 
  | 'Rings' 
  | 'Necklaces' 
  | 'Earrings' 
  | 'Bracelets' 
  | 'Bangles' 
  | 'Pendants' 
  | 'Chains' 
  | "Men's Jewellery" 
  | "Women's Jewellery" 
  | 'Custom Jewellery';

export interface DiamondCertification {
  issuer: 'GIA' | 'IGI' | 'HRD' | 'SGL' | 'Maison Hallmark Certificate';
  certificateNumber: string;
  reportUrl?: string;
  shape: DiamondShape;
  caratWeight: number;
  colorGrade: DiamondColor;
  clarityGrade: DiamondClarity;
  cutGrade?: DiamondCut;
  polish?: 'Excellent' | 'Very Good';
  symmetry?: 'Excellent' | 'Very Good';
  fluorescence?: 'None' | 'Faint' | 'Medium';
  laserInscription?: string;
  certifiedDate?: string;
}

export interface GemstoneDetails {
  type: StoneType;
  variety?: string; // e.g. "Royal Blue Ceylon", "Muzo Colombian", "Burmese Pigeon Blood"
  quantity: number;
  totalWeightCarats: number;
  origin?: string; // e.g. "Colombia", "Sri Lanka", "Myanmar", "Madagascar"
  treatment?: 'None / Untreated' | 'Traditional Minor Cedar Oil' | 'Heat Treated';
  dimensionsMm?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  metalType: MetalType;
  purity: GoldPurity;
  size?: string; // e.g. "US 6.5", "18 inch", "7.0 inch"
  stoneType?: StoneType;
  priceUSD: number;
  comparePriceUSD?: number;
  stock: number;
  weightGrams?: number;
  leadTimeDays?: number;
  isReadyToShip?: boolean;
  images?: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: 'main' | 'gallery' | 'lifestyle' | 'model' | 'detail' | 'certificate';
  sortOrder: number;
}

// Future 3D Model extension specification for Three.js / WebGL GLB viewer
export interface Product3DModel {
  modelUrl?: string; // e.g., "/models/ring_solitaire_18k.glb"
  thumbnailUrl?: string;
  status: 'draft' | 'published' | 'unavailable';
  format?: 'glb' | 'gltf';
  meshCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: ProductCategory;
  subcategory?: string;
  collection: string;
  gender: Gender;
  shortDescription: string;
  description: string;
  priceUSD: number;
  comparePriceUSD?: number;
  currency: string;
  
  // Metal & Craftsmanship
  metalType: MetalType;
  purity: GoldPurity;
  goldKarat?: string;
  metalColor?: string;
  grossWeightGrams: number;
  netGoldWeightGrams?: number;
  hallmarkAssayOffice?: string; // e.g., "Paris Assay Office Eagle Head Hallmark"
  dimensions?: string; // e.g., "Band 2.2mm, Center Setting 8.5mm"
  finish?: string; // e.g., 'High Mirror Polish', 'Hand-Brushed Satin', 'Florentine Textured'
  
  // Stone & Diamonds
  stoneType: StoneType;
  stoneWeightCarats?: number;
  totalCaratWeight?: number;
  gemstoneDetails?: GemstoneDetails;
  certification?: DiamondCertification;
  
  // Sizing & Bespoke Customization
  availableSizes?: string[]; // e.g. ["US 5", "US 6", "US 7", "US 8"]
  chainLengths?: string[]; // e.g. ["16 inch", "18 inch", "20 inch"]
  isCustomizable: boolean;
  isEngravingAvailable: boolean;
  maxEngravingChars?: number;
  
  // Logistics, Stock & Origin
  isReadyToShip: boolean;
  isMadeToOrder: boolean;
  productionLeadTimeDays: number;
  estimatedDispatchHours: number;
  stock: number;
  lowStockThreshold: number;
  countryOfOrigin: string; // e.g., "France (Paris Place Vendôme Atelier)"
  status: 'active' | 'archived' | 'out_of_stock';
  
  // Flags & Trust
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  warrantyPeriodYears: number; // e.g., 5 for 5-Year Atelier Warranty
  careInstructions: string;
  shippingInformation: string;
  returnEligibility: string;
  exchangeEligibility: string;
  
  // Media & Attachments
  images: ProductImage[];
  variants: ProductVariant[];
  videoUrl?: string;
  model3D?: Product3DModel;
  certificateDocumentUrl?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  itemCount: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  isFeatured: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  metalType: MetalType;
  purity: GoldPurity;
  size?: string;
  stoneType?: StoneType;
  engravingText?: string;
  unitPriceUSD: number;
  quantity: number;
  productionLeadTimeDays?: number;
  isReadyToShip?: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotalUSD: number;
  discountUSD: number;
  couponCode?: string;
  estimatedShippingUSD: number;
  estimatedTaxUSD: number;
  estimatedDutyUSD?: number;
  totalUSD: number;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'payment_pending' 
  | 'paid' 
  | 'confirmed' 
  | 'processing' 
  | 'made_to_order' 
  | 'ready_to_ship' 
  | 'shipped' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled' 
  | 'refund_requested' 
  | 'refunded' 
  | 'partially_refunded' 
  | 'failed';

export type PaymentStatus = 
  | 'pending' 
  | 'authorized' 
  | 'paid' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded' 
  | 'partially_refunded';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCallingCode?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  countryCode?: string;
  isBillingSameAsShipping?: boolean;
}

export interface OrderItem {
  id?: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  slug: string;
  image: string;
  metalType: MetalType;
  purity: GoldPurity;
  size?: string;
  stoneType?: StoneType;
  engravingText?: string;
  certificateNumber?: string;
  unitPriceUSD: number;
  quantity: number;
  totalUSD: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  items: OrderItem[];
  
  // Financial breakdown
  subtotalUSD: number;
  discountUSD: number;
  couponCode?: string;
  shippingCostUSD: number;
  taxCostUSD: number;
  customsDutyCostUSD?: number;
  totalUSD: number;
  
  // Multi-currency historical record
  currency: CurrencyCode;
  totalInCurrency: number;
  exchangeRateUsed: number;
  
  // Shipping & Logistics
  shippingMethodId: string;
  shippingMethodName: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  insurancePolicyNumber?: string;
  status: OrderStatus;
  statusHistory?: { status: OrderStatus; timestamp: string; note: string }[];
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod: 'wire_transfer' | 'apple_pay' | 'vip_concierge';
  paymentIntentId?: string;
  stripeChargeId?: string;
  
  // Atelier Production
  productionLeadTimeDays?: number;
  estimatedDeliveryDate?: string;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'superadmin' | 'gemologist' | 'logistics_manager';
  phone?: string;
  country?: string;
  addresses: ShippingAddress[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userCountry: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  verifiedPieceName?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderUSD?: number;
  expiryDate: string;
  isActive: boolean;
  description: string;
}

export interface ShippingMethodOption {
  id: string;
  name: string;
  carrier: string;
  description: string;
  costUSD: number;
  estimatedDays: string;
  isFreeAboveThreshold: boolean;
  insuranceIncluded: boolean;
  requiresSignature: boolean;
}

export type ShippingMethod = ShippingMethodOption;

export interface CountryTaxDutyRule {
  countryCode: string;
  countryName: string;
  currency: CurrencyCode;
  vatRatePercent: number; // e.g. 20 for UK/France 20% VAT
  customsDutyPercent: number; // e.g. 2.5 for jewellery import tariff
  taxName: string; // "VAT", "GST", "Sales Tax", "TVA"
  isTaxIncludedInPrice: boolean;
  dutyThresholdUSD: number; // value below which duty is waived
  courierSupported: string[];
}

export interface BespokeInquiry {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCountry: string;
  category: ProductCategory;
  metalPreference: MetalType;
  purityPreference: GoldPurity;
  stonePreference: StoneType;
  targetCarat?: number;
  targetBudgetUSD: string;
  sizeSpecification?: string;
  engravingMessage?: string;
  designDescription: string;
  referenceImageUrl?: string;
  timelineRequirement: string;
  status: 'inquiry_received' | 'consultation_scheduled' | 'cad_in_progress' | 'quotation_issued' | 'approved' | 'in_atelier';
  createdAt: string;
}

export type ConversationStatus = 
  | 'OPEN' 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'WAITING_FOR_USER' 
  | 'WAITING_FOR_ADMIN' 
  | 'RESOLVED' 
  | 'CLOSED';

export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ConversationType = 
  | 'product_modification' 
  | 'customization' 
  | 'order_inquiry' 
  | 'gemological_advice' 
  | 'bespoke_commission' 
  | 'general_concierge';

export interface ConversationAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'cad_drawing';
  sizeBytes?: number;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin' | 'atelier_staff' | 'master_jeweller' | 'gemologist';
  content: string;
  attachments?: ConversationAttachment[];
  attachmentUrl?: string;
  isInternalNote?: boolean; // Visible only to admins/staff
  createdAt: string;
  isReadByRecipient?: boolean;
}

export interface ConversationProductContext {
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  image: string;
  productImage?: string;
  priceUSD: number;
  productPriceUSD?: number;
  selectedMetal?: string;
  selectedPurity?: string;
  selectedSize?: string;
  selectedStone?: string;
  engravingRequested?: string;
}

export interface ConversationOrderContext {
  orderId: string;
  orderNumber: string;
  orderTotalUSD: number;
  orderDate: string;
  status: OrderStatus;
  trackingNumber?: string;
}

export interface Conversation {
  id: string;
  ticketNumber: string; // e.g. "AUR-CHAT-84920"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  type: ConversationType;
  status: ConversationStatus;
  priority: ConversationPriority;
  
  // Contextual linkages
  productId?: string;
  productContext?: ConversationProductContext;
  orderId?: string;
  orderContext?: ConversationOrderContext;
  
  // Assignment & Internal Notes
  assignedStaffId?: string;
  assignedStaffName?: string;
  internalNotes?: string;
  
  // Messages & Activity
  messages: ConversationMessage[];
  unreadByUserCount: number;
  unreadByAdminCount: number;
  
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface AtelierStaff {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'ATELIER_STAFF' | 'MASTER_JEWELLER' | 'SENIOR_GEMOLOGIST';
  title?: string;
  location?: string;
  avatarUrl?: string;
  avatar?: string;
  specialty?: string;
  certifications?: string[];
  activeTicketsCount?: number;
  activeConversationsCount?: number;
  isOnline?: boolean;
}
