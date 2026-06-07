'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, defaultLocale, type Locale } from '@/i18n/request';

interface LanguageContextType {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: readonly Locale[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const pathLocale = pathname.split('/')[1] as Locale;
    if (locales.includes(pathLocale)) {
      setCurrentLocaleState(pathLocale);
    } else {
      setCurrentLocaleState(defaultLocale);
    }

    // Load preferred language from localStorage only if pathname has default locale
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred-language') as Locale;
      if (saved && locales.includes(saved) && pathLocale === defaultLocale && saved !== pathLocale) {
        setLocale(saved);
      }
    }
  }, [pathname]);

  const setLocale = (locale: Locale) => {
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', locale);
    }

    // Change URL
    const newPath = `/${locale}${pathname.replace(/^\/[a-z]{2}/, '')}`;
    router.push(newPath);
  };

  return (
    <LanguageContext.Provider value={{
      currentLocale,
      setLocale,
      availableLocales: locales
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
