"use client"

import {useEffect, useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {ChevronLeft, ChevronRight, Globe, Search} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {useLocale, useTranslations} from 'next-intl'
import {useRouter} from '@/i18n/navigation'
import {isRtlLocale} from '@/lib/i18n'

interface AppHeaderProps {
  title?: string
  showBack?: boolean
  transparent?: boolean
}

const pageKeyByPath: Record<string, string> = {
  '/': 'home',
  '/news': 'news',
  '/arsenal': 'arsenal',
  '/martyrs': 'martyrs',
  '/documents': 'documents',
  '/search': 'search',
  '/achievements': 'achievements',
}

/** Section title for nested routes (e.g. /news/slug → news). */
function resolveNavKey(localPath: string): string {
  if (localPath === '/' || localPath === '') return 'home'
  const exact = pageKeyByPath[localPath]
  if (exact) return exact
  const prefixes: Array<{prefix: string; key: string}> = [
    {prefix: '/achievements', key: 'achievements'},
    {prefix: '/news', key: 'news'},
    {prefix: '/arsenal', key: 'arsenal'},
    {prefix: '/martyrs', key: 'martyrs'},
    {prefix: '/documents', key: 'documents'},
    {prefix: '/search', key: 'search'},
  ]
  for (const {prefix, key} of prefixes) {
    if (localPath.startsWith(`${prefix}/`)) return key
  }
  return 'home'
}

export function AppHeader({title, showBack, transparent = false}: AppHeaderProps) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const t = useTranslations('nav')
  const common = useTranslations('common')
  const locale = useLocale()
  const isRtl = isRtlLocale(locale as 'fa' | 'en')
  const router = useRouter()
  const pathname = usePathname()

  const localPath = pathname.replace(/^\/(fa|en)/, '') || '/'
  const pageTitle = title || t(resolveNavKey(localPath))

  const toggleLocale = () => {
    const targetLocale = locale === 'fa' ? 'en' : 'fa'
    router.replace(localPath, {locale: targetLocale})
  }
  const BackIcon = isRtl ? ChevronRight : ChevronLeft

  useEffect(() => {
    if (!transparent) return
    const onScroll = () => setHasScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparent])

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 ${(transparent && !hasScrolled) ? 'bg-transparent border-b border-transparent' : 'bg-[var(--color-ink)]/95 backdrop-blur-xl border-b border-[var(--color-ink-border)]'}`}>
      <div className="safe-area-top" />
      <div className="h-14 px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {showBack ? (
            <Button asChild variant="ghost" size="sm" className="text-[var(--color-text-secondary)]">
              <Link href={`/${locale}`}> 
                <BackIcon className="w-4 h-4" />
                {common('back')}
              </Link>
            </Button>
          ) : (
            <h1 className="text-sm md:text-base font-bold text-[var(--color-text-primary)] truncate">{pageTitle}</h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="text-[var(--color-text-secondary)]">
            <Link href={`/${locale}/search`} aria-label={common('search')}>
              <Search className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLocale} className="text-[var(--color-text-secondary)]">
            <Globe className="w-4 h-4" />
            <span className="ms-1">{locale === 'fa' ? 'EN' : 'FA'}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
