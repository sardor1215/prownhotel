'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Check if we're in admin panel - always use English
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  
  // Default to Turkish for website, English for admin
  const [language, setLanguageState] = useState<Language>(isAdmin ? 'en' : 'tr')

  useEffect(() => {
    // Check if we're in admin panel
    const pathname = window.location.pathname
    const isAdminPage = pathname.startsWith('/admin')
    
    if (isAdminPage) {
      // Force English for admin - always
      setLanguageState('en')
      document.documentElement.lang = 'en'
      return
    }

    // Load saved language preference or default to Turkish for website
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage === 'tr' || savedLanguage === 'en') {
      setLanguageState(savedLanguage)
      document.documentElement.lang = savedLanguage
    } else {
      // Default to Turkish for website
      setLanguageState('tr')
      localStorage.setItem('language', 'tr')
      document.documentElement.lang = 'tr'
    }
  }, [])

  const setLanguage = (lang: Language) => {
    // Don't allow language change in admin panel
    const isAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
    if (isAdminPage) {
      return
    }
    
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

