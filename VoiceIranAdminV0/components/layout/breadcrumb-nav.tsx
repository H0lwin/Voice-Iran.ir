'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useIsMobile } from '@/hooks/use-mobile'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const routeLabels: Record<string, string> = {
  dashboard: 'داشبورد',
  news: 'اخبار',
  arsenal: 'تسلیحات',
  martyrs: 'شهدا',
  documents: 'اسناد',
  achievements: 'دستاوردها',
  accounts: 'مدیریت',
  users: 'کاربران',
  roles: 'نقش‌ها',
  profiles: 'سطوح دسترسی',
  settings: 'هسته',
  taxonomy: 'طبقه‌بندی',
  seo: 'سئو',
  publishing: 'انتشار',
  'notifications-settings': 'اعلان‌ها',
  'api-management': 'API',
  analytics: 'تحلیل و گزارش',
  profile: 'پروفایل',
  new: 'جدید',
}

function toLabel(segment: string) {
  return routeLabels[segment] || segment
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const crumbs = useMemo(() => {
    const rawSegments = pathname.split('/').filter(Boolean)
    if (rawSegments.length === 0) return []

    const list = rawSegments.map((segment, index) => ({
      href: `/${rawSegments.slice(0, index + 1).join('/')}`,
      label: toLabel(segment),
      key: `${segment}-${index}`,
    }))

    const maxDepth = isMobile ? 2 : 4
    if (list.length <= maxDepth) return list

    return [
      list[0],
      { href: '', label: '...', key: 'ellipsis' },
      ...list.slice(list.length - (maxDepth - 2)),
    ]
  }, [isMobile, pathname])

  if (crumbs.length === 0 || (crumbs.length === 1 && crumbs[0]?.href === '/dashboard')) {
    return null
  }

  return (
    <nav className="min-w-0 text-small text-muted-foreground" aria-label="breadcrumb">
      <ol className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
        {crumbs.map((item, idx) => {
          const isLast = idx === crumbs.length - 1
          return (
            <li key={item.key} className="flex min-w-0 items-center gap-2">
              {idx > 0 && <span className="text-muted-foreground">‹</span>}
              {item.label === '...' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default">...</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{pathname}</span>
                  </TooltipContent>
                </Tooltip>
              ) : isLast ? (
                <span className="truncate text-foreground">{item.label}</span>
              ) : (
                <Link href={item.href} className="truncate hover:text-foreground">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}