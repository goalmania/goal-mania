import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

// Translations bundled at compile time — no async load, always available immediately
// eslint-disable-next-line @typescript-eslint/no-require-imports
const itTranslations = require('../messages/it.json')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const enTranslations = require('../messages/en.json')

const i18nInstance = createInstance()

i18nInstance
  .use(initReactI18next)
  .init({
    lng: 'it',
    fallbackLng: 'it',
    supportedLngs: ['en', 'it'],
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      it: { common: itTranslations },
      en: { common: enTranslations },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

export default i18nInstance
