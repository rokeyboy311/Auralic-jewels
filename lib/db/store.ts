import { 
  Product, 
  Order, 
  Review, 
  Category, 
  Collection, 
  Coupon, 
  ShippingMethodOption, 
  User, 
  BespokeInquiry, 
  OrderStatus,
  Conversation,
  ConversationMessage,
  ConversationStatus,
  ConversationPriority,
  AtelierStaff
} from '../types';
import { 
  mockProducts, 
  mockOrders, 
  mockReviews, 
  mockCategories, 
  mockCollections, 
  mockCoupons, 
  mockShippingMethods, 
  mockUsers, 
  mockBespokeInquiries,
  mockConversations,
  mockStaff
} from './mockDb';
import { calculateInternationalDutyAndTax } from '../internationalConfig';

class DatabaseStore {
  private products: Product[] = [...mockProducts];
  private orders: Order[] = [...mockOrders];
  private reviews: Review[] = [...mockReviews];
  private categories: Category[] = [...mockCategories];
  private collections: Collection[] = [...mockCollections];
  private coupons: Coupon[] = [...mockCoupons];
  private shippingMethods: ShippingMethodOption[] = [...mockShippingMethods];
  private users: User[] = [...mockUsers];
  private bespokeInquiries: BespokeInquiry[] = [...mockBespokeInquiries];
  private conversations: Conversation[] = [...mockConversations];
  private staff: AtelierStaff[] = [...mockStaff];

  // Products
  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  saveProduct(productData: Partial<Product>): Product {
    if (productData.id) {
      const idx = this.products.findIndex((p) => p.id === productData.id);
      if (idx !== -1) {
        this.products[idx] = {
          ...this.products[idx],
          ...productData,
          updatedAt: new Date().toISOString(),
        } as Product;
        return this.products[idx];
      }
    }
    const newProduct: Product = {
      id: productData.id || `prod-${Date.now()}`,
      name: productData.name || 'New Fine Jewellery Piece',
      slug: productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `jewel-${Date.now()}`),
      sku: productData.sku || `AUR-JW-${Date.now().toString().slice(-4)}`,
      brand: 'Maison Aurelia',
      category: productData.category || 'Rings',
      subcategory: productData.subcategory || 'Fine Jewellery',
      collection: productData.collection || 'Solitaire Masterpieces',
      gender: productData.gender || 'Women',
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      priceUSD: productData.priceUSD || 1000,
      comparePriceUSD: productData.comparePriceUSD,
      currency: 'USD',
      metalType: productData.metalType || 'Yellow Gold',
      purity: productData.purity || '18K',
      goldKarat: productData.goldKarat || '18 Karat (750/1000 Fine Gold)',
      metalColor: productData.metalColor || 'Yellow Gold',
      grossWeightGrams: productData.grossWeightGrams || 5.0,
      netGoldWeightGrams: productData.netGoldWeightGrams || 4.5,
      hallmarkAssayOffice: productData.hallmarkAssayOffice || 'Paris Assay Office Hallmark',
      dimensions: productData.dimensions,
      finish: productData.finish || 'High Mirror Polish',
      stoneType: productData.stoneType || 'Natural Diamond',
      stoneWeightCarats: productData.stoneWeightCarats,
      totalCaratWeight: productData.totalCaratWeight,
      gemstoneDetails: productData.gemstoneDetails,
      certification: productData.certification,
      availableSizes: productData.availableSizes || ['US 5.0', 'US 6.0', 'US 7.0', 'US 8.0'],
      isCustomizable: productData.isCustomizable ?? true,
      isEngravingAvailable: productData.isEngravingAvailable ?? true,
      maxEngravingChars: productData.maxEngravingChars || 24,
      isReadyToShip: productData.isReadyToShip ?? true,
      isMadeToOrder: productData.isMadeToOrder ?? false,
      productionLeadTimeDays: productData.productionLeadTimeDays || 2,
      estimatedDispatchHours: productData.estimatedDispatchHours || 24,
      stock: productData.stock ?? 10,
      lowStockThreshold: productData.lowStockThreshold || 2,
      countryOfOrigin: productData.countryOfOrigin || 'France (Paris Place Vendôme Atelier)',
      status: productData.status || 'active',
      isFeatured: productData.isFeatured || false,
      isNewArrival: productData.isNewArrival || true,
      isBestSeller: productData.isBestSeller || false,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 0,
      warrantyPeriodYears: productData.warrantyPeriodYears || 5,
      careInstructions: productData.careInstructions || 'Clean gently with mild soap and warm water. Store in soft suede pouch.',
      shippingInformation: productData.shippingInformation || 'Complimentary worldwide insured armored courier.',
      returnEligibility: productData.returnEligibility || '30-day worldwide complimentary return with original security tag intact.',
      exchangeEligibility: productData.exchangeEligibility || 'Lifetime diamond and precious metal trade-up privilege.',
      images: productData.images && productData.images.length > 0 ? productData.images : [
        {
          id: `img-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
          alt: productData.name || 'Fine Jewellery',
          type: 'main',
          sortOrder: 1,
        }
      ],
      variants: productData.variants || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    return this.products.length < initialLen;
  }

  // Categories & Collections
  getCategories(): Category[] {
    return this.categories;
  }

  getCollections(): Collection[] {
    return this.collections;
  }

  // Coupons
  getCoupon(code: string): Coupon | undefined {
    return this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  }

  // Shipping
  getShippingMethods(): ShippingMethodOption[] {
    return this.shippingMethods;
  }

  // Orders & Stock Validation
  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  createOrder(orderPayload: Partial<Order>): { success: boolean; order?: Order; error?: string } {
    // 1. Recalculate prices server-side to prevent client tampering
    let subtotalUSD = 0;
    const validatedItems = (orderPayload.items || []).map((item) => {
      const prod = this.getProductById(item.productId);
      const unitPrice = prod ? prod.priceUSD : item.unitPriceUSD;
      const itemTotal = unitPrice * item.quantity;
      subtotalUSD += itemTotal;

      // Deduct inventory stock if ready to ship
      if (prod && prod.stock >= item.quantity) {
        prod.stock -= item.quantity;
      }

      return {
        ...item,
        unitPriceUSD: unitPrice,
        totalUSD: itemTotal,
        certificateNumber: prod?.certification?.certificateNumber,
      };
    });

    // 2. Validate Discount Coupon
    let discountUSD = 0;
    let validCouponCode: string | undefined = undefined;
    if (orderPayload.couponCode) {
      const coupon = this.getCoupon(orderPayload.couponCode);
      if (coupon) {
        if (!coupon.minOrderUSD || subtotalUSD >= coupon.minOrderUSD) {
          validCouponCode = coupon.code;
          if (coupon.discountType === 'percentage') {
            discountUSD = Math.round(((subtotalUSD * coupon.discountValue) / 100) * 100) / 100;
          } else {
            discountUSD = Math.min(coupon.discountValue, subtotalUSD);
          }
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotalUSD - discountUSD);

    // 3. Calculate Country-Specific Duty & Tax
    const destinationCountryCode = orderPayload.shippingAddress?.countryCode || 'US';
    const { taxAmountUSD, dutyAmountUSD } = calculateInternationalDutyAndTax(discountedSubtotal, destinationCountryCode);

    // 4. Calculate Shipping Cost
    const shippingMethod = this.shippingMethods.find((s) => s.id === orderPayload.shippingMethodId) || this.shippingMethods[0];
    const shippingCostUSD = (shippingMethod.isFreeAboveThreshold && discountedSubtotal >= 1000) ? 0 : shippingMethod.costUSD;

    const totalUSD = Math.round((discountedSubtotal + shippingCostUSD + taxAmountUSD + dutyAmountUSD) * 100) / 100;

    const orderNumber = `AUR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: orderPayload.userId,
      customerEmail: orderPayload.customerEmail || orderPayload.shippingAddress?.email || 'patron@domain.com',
      customerPhone: orderPayload.customerPhone || orderPayload.shippingAddress?.phone || '',
      shippingAddress: orderPayload.shippingAddress || {
        firstName: 'Valued',
        lastName: 'Patron',
        email: 'patron@domain.com',
        phone: '',
        addressLine1: '',
        city: '',
        stateOrProvince: '',
        postalCode: '',
        country: 'United States',
        countryCode: 'US',
      },
      billingAddress: orderPayload.billingAddress || orderPayload.shippingAddress,
      items: validatedItems,
      subtotalUSD,
      discountUSD,
      couponCode: validCouponCode,
      shippingCostUSD,
      taxCostUSD: taxAmountUSD,
      customsDutyCostUSD: dutyAmountUSD,
      totalUSD,
      currency: orderPayload.currency || 'USD',
      totalInCurrency: orderPayload.totalInCurrency || totalUSD,
      exchangeRateUsed: orderPayload.exchangeRateUsed || 1.0,
      shippingMethodId: shippingMethod.id,
      shippingMethodName: shippingMethod.name,
      carrierName: shippingMethod.carrier,
      trackingNumber: `FG-VAL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      trackingUrl: 'https://www.ferrarigroup.net',
      insurancePolicyNumber: `LLOYDS-VENDOME-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: orderPayload.paymentMethod || 'stripe',
      paymentIntentId: orderPayload.paymentIntentId || `pi_${Date.now()}_AureliaLive`,
      notes: orderPayload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.orders.unshift(newOrder);
    return { success: true, order: newOrder };
  }

  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    carrierName?: string
  ): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.status = status;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (carrierName) order.carrierName = carrierName;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        note: `Status transitioned to ${status} by Atelier Logistics Dispatch`,
      });
      order.updatedAt = new Date().toISOString();
    }
    return order;
  }

  // Bespoke Custom Jewellery Inquiries
  getBespokeInquiries(): BespokeInquiry[] {
    return this.bespokeInquiries;
  }

  createBespokeInquiry(inquiryData: Omit<BespokeInquiry, 'id' | 'referenceNumber' | 'status' | 'createdAt'>): BespokeInquiry {
    const newInquiry: BespokeInquiry = {
      ...inquiryData,
      id: `bespoke-${Date.now()}`,
      referenceNumber: `BESPOKE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'inquiry_received',
      createdAt: new Date().toISOString(),
    };
    this.bespokeInquiries.unshift(newInquiry);
    return newInquiry;
  }

  // Reviews
  getReviews(productId?: string): Review[] {
    if (productId) {
      return this.reviews.filter((r) => r.productId === productId);
    }
    return this.reviews;
  }

  addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(newRev);

    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      const prodReviews = this.getReviews(prod.id);
      const totalScore = prodReviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = parseFloat((totalScore / prodReviews.length).toFixed(2));
      prod.reviewCount = prodReviews.length;
    }

    return newRev;
  }

  // Users
  getUsers(): User[] {
    return this.users;
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'Patron',
      email: userData.email || '',
      role: userData.role || 'customer',
      phone: userData.phone,
      country: userData.country || 'France',
      addresses: userData.addresses || [],
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Conversations & Chat
  getConversations(filter?: { userId?: string; status?: string; priority?: string; search?: string }): Conversation[] {
    let result = [...this.conversations];
    if (filter && filter.userId) {
      const uid = filter.userId.toLowerCase();
      result = result.filter((c) => c.userId.toLowerCase() === uid || c.userEmail.toLowerCase() === uid);
    }
    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((c) => c.status === filter.status);
    }
    if (filter?.priority && filter.priority !== 'ALL') {
      result = result.filter((c) => c.priority === filter.priority);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.ticketNumber.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          c.userEmail.toLowerCase().includes(q) ||
          c.productContext?.productName.toLowerCase().includes(q) ||
          c.orderContext?.orderNumber.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getConversationById(id: string): Conversation | undefined {
    return this.conversations.find((c) => c.id === id || c.ticketNumber === id);
  }

  createConversation(data: Partial<Conversation> & { initialMessage?: string }): Conversation {
    const newId = `conv-${Date.now()}`;
    const ticketNumber = `AUR-CHAT-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const initialMessages: ConversationMessage[] = [];
    if (data.initialMessage) {
      initialMessages.push({
        id: `msg-${Date.now()}-1`,
        conversationId: newId,
        senderId: data.userId || 'usr-client-01',
        senderName: data.userName || 'Valued Patron',
        senderRole: 'customer',
        content: data.initialMessage,
        createdAt: now,
        isReadByRecipient: false,
      });
    } else if (data.messages && data.messages.length > 0) {
      initialMessages.push(...data.messages);
    }

    const newConv: Conversation = {
      id: newId,
      ticketNumber,
      userId: data.userId || 'usr-client-01',
      userName: data.userName || 'Valued Patron',
      userEmail: data.userEmail || 'patron@domain.com',
      userPhone: data.userPhone,
      subject: data.subject || 'Atelier Fine Jewellery Inquiry',
      type: data.type || 'general_concierge',
      status: data.status || 'OPEN',
      priority: data.priority || 'medium',
      productId: data.productId,
      productContext: data.productContext,
      orderId: data.orderId,
      orderContext: data.orderContext,
      assignedStaffId: data.assignedStaffId || 'stf-04',
      assignedStaffName: data.assignedStaffName || 'Claire de Montmirail',
      internalNotes: data.internalNotes,
      messages: initialMessages,
      unreadByUserCount: 0,
      unreadByAdminCount: initialMessages.length > 0 ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    };

    this.conversations.unshift(newConv);
    return newConv;
  }

  addMessageToConversation(
    conversationId: string,
    messageData: {
      senderId: string;
      senderName: string;
      senderRole: 'customer' | 'admin' | 'atelier_staff' | 'master_jeweller' | 'gemologist';
      content: string;
      attachments?: any[];
      isInternalNote?: boolean;
    }
  ): ConversationMessage | null {
    const convIndex = this.conversations.findIndex((c) => c.id === conversationId || c.ticketNumber === conversationId);
    if (convIndex === -1) return null;

    const now = new Date().toISOString();
    const newMsg: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      conversationId: this.conversations[convIndex].id,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderRole: messageData.senderRole,
      content: messageData.content,
      attachments: messageData.attachments || [],
      isInternalNote: messageData.isInternalNote || false,
      createdAt: now,
      isReadByRecipient: false,
    };

    this.conversations[convIndex].messages.push(newMsg);
    this.conversations[convIndex].updatedAt = now;

    if (messageData.senderRole === 'customer') {
      this.conversations[convIndex].unreadByAdminCount += 1;
      if (this.conversations[convIndex].status === 'WAITING_FOR_USER' || this.conversations[convIndex].status === 'RESOLVED') {
        this.conversations[convIndex].status = 'IN_PROGRESS';
      }
    } else {
      if (!messageData.isInternalNote) {
        this.conversations[convIndex].unreadByUserCount += 1;
        this.conversations[convIndex].status = 'WAITING_FOR_USER';
      }
    }

    return newMsg;
  }

  updateConversation(
    id: string,
    updates: Partial<Pick<Conversation, 'status' | 'priority' | 'assignedStaffId' | 'assignedStaffName' | 'internalNotes'>>
  ): Conversation | null {
    const idx = this.conversations.findIndex((c) => c.id === id || c.ticketNumber === id);
    if (idx === -1) return null;

    this.conversations[idx] = {
      ...this.conversations[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      resolvedAt: updates.status === 'RESOLVED' || updates.status === 'CLOSED' ? new Date().toISOString() : this.conversations[idx].resolvedAt,
    };

    return this.conversations[idx];
  }

  markConversationRead(id: string, reader: 'user' | 'admin'): boolean {
    const idx = this.conversations.findIndex((c) => c.id === id || c.ticketNumber === id);
    if (idx === -1) return false;

    if (reader === 'user') {
      this.conversations[idx].unreadByUserCount = 0;
    } else {
      this.conversations[idx].unreadByAdminCount = 0;
    }
    return true;
  }

  // Staff
  getStaff(): AtelierStaff[] {
    return this.staff;
  }
}

declare global {
  var __aurelia_db_store: DatabaseStore | undefined;
}

export const dbStore = globalThis.__aurelia_db_store || (globalThis.__aurelia_db_store = new DatabaseStore());
