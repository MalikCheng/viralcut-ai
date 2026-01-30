import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Priority 1: URL Query Param (for SEO friendly links)
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam && ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko'].includes(langParam)) {
      setLanguageState(langParam as Language);
    } else {
        // Priority 2: Browser Language
        const browserLang = navigator.language.split('-')[0];
        if (['zh', 'es', 'fr', 'de', 'ja', 'ko'].includes(browserLang)) {
            setLanguageState(browserLang as Language);
        } else {
            setLanguageState('en');
        }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // Update URL without reloading to allow sharing and bookmarking specific languages
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.pushState({}, '', url);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Missing translation for key: ${path} in language: ${language}`);
        return path;
      }
      current = current[key];
    }
    
    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};