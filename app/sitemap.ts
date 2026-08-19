import { MetadataRoute } from 'next';
import { mockProducts } from '@/lib/db/mockDb';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const productRoutes = mockProducts.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
