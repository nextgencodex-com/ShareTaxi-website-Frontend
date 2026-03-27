import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

export default createMiddleware({
  // List of supported locales
  locales,

  // Default locale
  defaultLocale,

  // Pathname locale detection strategy
  localeDetection: true,

  // Define the prefix for locale directories
  localePrefix: 'always'  // or 'as-needed' if you want to hide default locale
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|si|ta)/:path*']
};
