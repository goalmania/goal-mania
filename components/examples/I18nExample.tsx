'use client'

import { useI18n } from '@/lib/hooks/useI18n'
import { useLanguageStore } from '@/lib/store/language'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function I18nExample() {
  const { t, language } = useI18n()
  const { setLanguage } = useLanguageStore()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'it' : 'en')
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('navigation.home')}</CardTitle>
          <CardDescription>{t('shop.hero.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Navigation</h3>
              <ul className="space-y-1 text-sm">
                <li>{t('navigation.home')}</li>
                <li>{t('navigation.news')}</li>
                <li>{t('navigation.shop')}</li>
                <li>{t('navigation.about')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <ul className="space-y-1 text-sm">
                <li>{t('auth.signIn')}</li>
                <li>{t('auth.signUp')}</li>
                <li>{t('auth.myProfile')}</li>
                <li>{t('auth.myOrders')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Shop Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium">{t('shop.highlights.quality.title')}</h4>
                <p className="text-muted-foreground">{t('shop.highlights.quality.description')}</p>
              </div>
              <div>
                <h4 className="font-medium">{t('shop.highlights.unique.title')}</h4>
                <p className="text-muted-foreground">{t('shop.highlights.unique.description')}</p>
              </div>
              <div>
                <h4 className="font-medium">{t('shop.highlights.fit.title')}</h4>
                <p className="text-muted-foreground">{t('shop.highlights.fit.description')}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button onClick={toggleLanguage} variant="outline">
              {language === 'en' ? 'Switch to Italiano' : 'Passa all\'Inglese'}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Current language: {language === 'en' ? 'English' : 'Italiano'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 