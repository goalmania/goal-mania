import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

let i18nInstance: any = null

const initI18next = async (locale: string, ns: string = 'common') => {
  if (i18nInstance) {
    // If instance exists, just change language
    await i18nInstance.changeLanguage(locale)
    return i18nInstance
  }

  i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => 
      import(`../messages/${language}.json`)
    ))
    .init({
      lng: locale,
      fallbackLng: 'it',
      supportedLngs: ['en', 'it'],
      ns: ['common'],
      defaultNS: 'common',
      fallbackNS: 'common',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })
  return i18nInstance
}

export default initI18next 