import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import QueryProvider from './QueryProvider'
import LanguageWrapper from '@/components/LanguageWrapper'


// Preload the Inter font with all necessary weights and subsets
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
})

// Define viewport settings
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "Crown Salamis Hotel - Luxury Experience in Cyprus",
  description: "Experience luxury at Crown Salamis Hotel in Cyprus. Premium rooms, exceptional service, and world-class amenities on the Nicosia-Famagusta Road. Book your perfect stay today.",
  keywords: 'crown salamis hotel, luxury hotel cyprus, nicosia hotel, famagusta hotel, balikesir hotel, cyprus accommodation, premium rooms, hotel booking',
  authors: [{ name: "Crown Salamis Hotel" }],
  metadataBase: new URL('https://crownsalamishotel.com'),
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  openGraph: {
    title: "Crown Salamis Hotel - Luxury Experience in Cyprus",
    description: "Experience luxury at Crown Salamis Hotel in Cyprus. Premium rooms, exceptional service, and world-class amenities. Book your perfect stay today.",
    url: 'https://crownsalamishotel.com',
    siteName: "Crown Salamis Hotel",
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/imgtouse/IMGM8943.JPG',
        width: 1200,
        height: 630,
        alt: "Crown Salamis Hotel",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Crown Salamis Hotel - Luxury Experience in Cyprus",
    description: "Experience luxury at Crown Salamis Hotel in Cyprus. Premium rooms, exceptional service, and world-class amenities. Book your perfect stay today.",
    images: ['/imgtouse/IMGM8943.JPG'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

function Navbar() {
  return (
    <nav className="navbar-glass fade-in">
      {/* <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
     
        <div className="flex items-center gap-2 font-bold text-2xl tracking-wide">
         
          <span className="bg-dusk3 px-2 py-1 rounded-md text-dusk6">ORBA</span>
          <span className="text-dusk5">SHOWER</span>
        </div>
        
        <ul className="hidden md:flex gap-2 text-lg font-medium">
          <li><a className="nav-link" href="#">Ürünler</a></li>
        </ul>
      </div> */}
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-light text-text antialiased">
        <QueryProvider>
          <LanguageWrapper>
            {/* <Navbar /> */}
            {children}

            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff333',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </LanguageWrapper>
        </QueryProvider>
      </body>
    </html>
  )
} 