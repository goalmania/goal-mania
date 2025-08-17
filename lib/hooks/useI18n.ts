'use client'

import { useTranslation } from 'react-i18next'
import { useLanguageStore } from '@/lib/store/language'
import { useEffect } from 'react'

export function useI18n(ns: string = 'common') {
  const { language } = useLanguageStore()
  const { t, i18n } = useTranslation(ns)

  useEffect(() => {
    if (i18n.language !== language) {
      console.log('🔄 useI18n: Changing language from', i18n.language, 'to', language)
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  // Debug hook usage
  console.log('🪝 useI18n hook:', {
    storeLanguage: language,
    i18nLanguage: i18n.language,
    i18nReady: i18n.isInitialized,
    namespace: ns
  })

  return {
    t,
    language,
    i18n,
  }
} 