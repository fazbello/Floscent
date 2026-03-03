import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://floscent.belloite.com'),
  title: {
    default: 'Floscent – The World\'s First Luxury Perfume Vending Machine',
    template: '%s | Floscent',
  },
  description:
    'Floscent brings the world\'s first luxury perfume vending machine experience. Developed in Europe, generating high-margin passive income for partners worldwide. Premium custom fragrances delivered automatically.',
  keywords: [
    'luxury perfume vending machine',
    'fragrance vending machine',
    'passive income perfume',
    'custom fragrance',
    'Floscent',
    'premium scent machine',
    'perfume dispenser',
    'scent branding',
    'luxury fragrance technology',
    'European perfume machine',
  ],
  authors: [{ name: 'Floscent', url: 'https://floscent.belloite.com' }],
  creator: 'Floscent',
  publisher: 'Floscent',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://floscent.belloite.com',
    siteName: 'Floscent',
    title: 'Floscent – The World\'s First Luxury Perfume Vending Machine',
    description:
      'Generate high-margin passive income with the world\'s first luxury perfume vending machine, developed in Europe.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Floscent Luxury Perfume Vending Machine' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Floscent – Luxury Perfume Vending Machine',
    description: 'The world\'s first luxury perfume vending machine. Generate high-margin passive income starting today.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Floscent',
              url: 'https://floscent.belloite.com',
              logo: 'https://floscent.belloite.com/logo.png',
              description: "The world's first luxury perfume vending machine",
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'hello@floscent.com',
                contactType: 'customer service',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-dark-950 text-dark-100 antialiased">
        {children}
      </body>
    </html>
  )
}
