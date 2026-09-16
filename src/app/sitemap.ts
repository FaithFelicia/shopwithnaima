import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/product-detail`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: 'never', priority: 0.3 },
    { url: `${baseUrl}/checkout`, lastModified: new Date(), changeFrequency: 'never', priority: 0.3 },
    { url: `${baseUrl}/sign-up-login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}