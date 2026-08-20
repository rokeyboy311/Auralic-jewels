import { MetadataRoute } from 'next';
import api from '@/lib/api';
import { Product } from '@/lib/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureliajewels.com';

  const staticRoutes = [
    '',
    '/shop',
    '/collections',
    '/custom-jewellery',
    '/about',
    '/jewellery-guide',
    '/size-guide',
    '/materials-care',
    '/shipping-policy',
    '/returns-refunds',
    '/privacy-policy',
    '/terms-conditions',
    '/contact',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  let productRoutes: any[] = [];
  try {
    const res = await api.get('/products?limit=100');
    if (res.success && res.data) {
      productRoutes = (res.data as Product[]).map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: new Date(p.updatedAt || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));
    }
  } catch (err) {
    console.error('Failed to fetch products for sitemap:', err);
  }

  return [...staticRoutes, ...productRoutes];
}
