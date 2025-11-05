'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { LanguageProvider } from '@/contexts/LanguageContext'

export default function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  useEffect(() => {
    // Check if we're in admin panel
    const isAdmin = pathname.startsWith('/admin')
    
    if (isAdmin) {
      // Force English for admin - always
      document.documentElement.lang = 'en'
      // Don't change localStorage for admin, just ensure it's set to English
    } else {
      // Set default language to Turkish for website
      const savedLanguage = localStorage.getItem('language')
      const lang = savedLanguage === 'en' ? 'en' : 'tr' // Default to Turkish if not set
      
      if (!savedLanguage) {
        localStorage.setItem('language', 'tr')
      }
      
      // Update HTML lang attribute
      document.documentElement.lang = lang
    }
  }, [pathname])

  return <LanguageProvider>{children}</LanguageProvider>
}

