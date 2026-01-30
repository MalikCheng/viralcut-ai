import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { APP_DOMAIN } from '../config';

export const AppHead: React.FC = () => {
  const { language } = useLanguage();
  const seo = translations[language].seo;

  return (
    <Helmet>
      <html lang={language} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : language} />
      <meta property="og:url" content={APP_DOMAIN} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      
      {/* Canonical URL - Important for SEO. Tells Google this is the master copy. */}
      {/* If language is 'en', point to root. Otherwise point to ?lang=xx */}
      <link rel="canonical" href={`${APP_DOMAIN}/${language === 'en' ? '' : '?lang=' + language}`} />
    </Helmet>
  );
};