"use client"

import { useLanguage } from "@/lib/utils/language"
import { useI18n } from "@/lib/hooks/useI18n"
import { Button } from "@/components/ui/button"

export default function ApiTestPage() {
  const { language, toggleLanguage, isHydrated } = useLanguage()
  const { t } = useI18n()

  console.log('🎯 Test page render - language:', language, 'hydrated:', isHydrated)

  if (!isHydrated) {
    return <div className="container mx-auto p-8">Loading language store...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">i18n Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Language Store Test</h2>
          <p>Current Language: <strong>{language}</strong></p>
          <p>Store Hydrated: <strong>{isHydrated ? 'Yes' : 'No'}</strong></p>
          <Button onClick={toggleLanguage} className="mt-2">
            Toggle Language
          </Button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Translation Test</h2>
          <p>Sign Out: <strong>{t('auth.signOut')}</strong></p>
          <p>Language Switch: <strong>{language === "en" ? t('language.switchToItalian') : t('language.switchToEnglish')}</strong></p>
        </div>
      </div>
    </div>
  )
}
