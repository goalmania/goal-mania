import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

const initI18next = async (locale: string, ns: string) => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => 
      import(`../../public/locales/${language}/${namespace}.json`)
    ))
    .init({
      lng: locale,
      fallbackLng: 'it',
      supportedLngs: ['en', 'it'],
      ns: [ns],
      defaultNS: ns,
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

export async function getTranslation(locale: string, ns: string = 'common') {
  const i18nInstance = await initI18next(locale, ns)
  return {
    t: i18nInstance.getFixedT(locale, ns),
    i18n: i18nInstance,
  }
} 