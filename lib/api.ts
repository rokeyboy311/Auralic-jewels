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
  return await fetchApi<Product[]>(`/products${qs ? `?${qs}` : ''}`);
}

export async function getProduct(slugOrId: string) {
  return await fetchApi<Product>(`/products/${encodeURIComponent(slugOrId)}`);
}

export async function getProductBySlug(slug: string) {
  return await getProduct(slug);
}

// Categories & Collections
export async function getCategories() {
  return await fetchApi<Category[]>('/categories');
}

export async function getCollections() {
  return await fetchApi<Collection[]>('/collections');
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

// Media Upload via Cloudinary
export async function uploadImage(file: File, folder: string = 'auralic_jewels') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return await fetchApi<{ url: string; publicId: string; format: string; bytes: number }>('/uploads/image', {
    method: 'POST',
    body: formData,
  });
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
