// i18n/request.ts
// This is a simplified placeholder after removing next-intl

export const locales = ['en'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

// Dummy config for compatibility
export default {
  locale: defaultLocale,
  messages: {},
};
