"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconLanguage,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "next-auth/react"
import { useLanguage } from "@/lib/utils/language"
import { useI18n } from "@/lib/hooks/useI18n"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { language, toggleLanguage, isHydrated } = useLanguage()
  const { t, i18n } = useI18n()

  // Debug: Log current state
  console.log('🎯 NavUser render - language:', language, 'hydrated:', isHydrated, 'translation:', t('auth.signOut'))
  console.log('🎯 NavUser i18n context:', {
    i18nLanguage: i18n.language,
    i18nReady: i18n.isInitialized,
    storeLanguage: language
  })

  // Don't render until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    console.log('⏳ NavUser: Waiting for hydration...')
    return <div>Loading...</div>
  }

  const handleLanguageToggle = () => {
    console.log('🔄 NavUser: Language toggle clicked, current language:', language)
    console.log('🔄 NavUser: i18n language before toggle:', i18n.language)
    toggleLanguage()
    console.log('🔄 NavUser: toggleLanguage called')
  }

  return (
    <div>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name.split(" ")[0].charAt(0)}{user.name.split(" ")[1]?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.name.split(" ")[0].charAt(0)}{user.name.split(" ")[1]?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleLanguageToggle}>
                  <IconLanguage />
                  <span className="ml-2">
                    {language === "en" ? t('language.switchToItalian') : t('language.switchToEnglish')}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <IconLogout />
                <span className="ml-2">{t('auth.signOut')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  )
}
