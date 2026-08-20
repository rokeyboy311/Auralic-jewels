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
// In development within Next.js, relative '/api' calls the integrated Next.js API proxy routes.
// In production on Vercel, NEXT_PUBLIC_API_URL points to the Render backend API.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auralic_jwt_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem('auralic_jwt_token', token);
    } else {
      localStorage.removeItem('auralic_jwt_token');
    }
  } catch {
    // ignore write errors
  }
}

export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string; total?: number }> {
  try {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = getAuthToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      credentials: 'include',
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
  return await fetchApi<Product>(`/products/${slugOrId}`);
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
export async function createPaymentIntent(amountUSD: number, currency: string = 'USD') {
  return await fetchApi<{ clientSecret: string }>('/stripe/intent', {
    method: 'POST',
    body: JSON.stringify({ amountUSD, currency }),
  });
}

export async function createOrder(orderPayload: Partial<Order>) {
  return await fetchApi<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
}

export async function getOrder(id: string) {
  return await fetchApi<Order>(`/orders/${id}`);
}

export async function trackOrder(orderNumber: string, email?: string) {
  return await fetchApi<Order>('/orders/track', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, email }),
  });
}

// Auth API
export async function loginUser(email: string, password?: string) {
  const res = await fetchApi<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.success && res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res;
}

export async function registerUser(userData: { name: string; email: string; password?: string; phone?: string }) {
  const res = await fetchApi<{ user: User; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (res.success && res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res;
}

export async function loginWithGoogle(payload?: { credential?: string; idToken?: string; email?: string; name?: string }) {
  const res = await fetchApi<{ user: User; token: string }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
  if (res.success && res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res;
}

export async function getCurrentUserProfile() {
  return await fetchApi<User>('/auth/me');
}

export async function logoutUser() {
  setAuthToken(null);
  return await fetchApi<{ success: boolean }>('/auth/logout', { method: 'POST' });
}

// Reviews
export async function getProductReviews(productId: string) {
  return await fetchApi<Review[]>(`/reviews?productId=${productId}`);
}

export async function submitProductReview(review: Omit<Review, 'id' | 'createdAt'>) {
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

// Admin API
export async function getAdminStats() {
  return await fetchApi<any>('/admin/stats');
}

export async function getAdminOrders() {
  return await fetchApi<Order[]>('/admin/orders');
}

export async function updateAdminOrderStatus(orderId: string, status: string, trackingNumber?: string, carrierName?: string) {
  return await fetchApi<Order>(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, trackingNumber, carrierName }),
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
  return await fetchApi<{ id: string }>(`/admin/products/${productId}`, {
    method: 'DELETE',
  });
}

export const deleteAdminProduct = deleteProduct;

// Conversations & Atelier Chat API
export async function getConversations(params: { userId?: string; status?: string; priority?: string; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.userId) query.set('userId', params.userId);
  if (params.status) query.set('status', params.status);
  if (params.priority) query.set('priority', params.priority);
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return await fetchApi<Conversation[]>(`/conversations${qs ? `?${qs}` : ''}`);
}

export async function getConversation(id: string, readBy?: 'user' | 'admin') {
  const qs = readBy ? `?readBy=${readBy}` : '';
  return await fetchApi<Conversation>(`/conversations/${id}${qs}`);
}

export async function createConversation(payload: {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  subject: string;
  type?: string;
  priority?: string;
  initialMessage: string;
  productId?: string;
  productContext?: any;
  orderId?: string;
  orderContext?: any;
}) {
  return await fetchApi<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendConversationMessage(
  conversationId: string,
  payload: {
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    attachments?: any[];
    isInternalNote?: boolean;
  }
) {
  return await fetchApi<{ message: ConversationMessage; conversation: Conversation }>(
    `/conversations/${conversationId}/messages`,
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
  return await fetchApi<Conversation>(`/conversations/${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getStaffDirectory() {
  return await fetchApi<AtelierStaff[]>('/admin/staff');
}
