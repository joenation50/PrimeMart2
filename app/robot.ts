// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/account/', '/api/'],
    },
    sitemap: 'https://primemart.com/sitemap.xml',
  };
}