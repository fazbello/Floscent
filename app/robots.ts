import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://floscent.belloite.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/onboard', '/blog'],
        disallow: ['/admin/', '/client/', '/api/', '/login', '/register'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
