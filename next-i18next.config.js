module.exports = {
  i18n: {
    defaultLocale: 'it',
    locales: ['en', 'it'],
    localeDetection: true,
  },
  defaultNS: 'common',
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
  fallbackLng: 'it',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
} 