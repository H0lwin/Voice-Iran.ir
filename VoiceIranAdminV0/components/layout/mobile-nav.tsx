'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Newspaper, Bell, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'داشبورد', icon: LayoutDashboard, href: '/dashboard' },
  { title: 'اخبار', icon: Newspaper, href: '/dashboard/news' },
  { title: 'اعلان‌ها', icon: Bell, href: '/dashboard/notifications-settings' },
  { title: 'تحلیل', icon: BarChart3, href: '/dashboard/analytics' },
  { title: 'پروفایل', icon: User, href: '/dashboard/profile' },
]

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[280] border-t border-border bg-background md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex min-w-14 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'absolute inset-x-2 top-0 h-[2px] rounded-full bg-transparent',
                  active && 'bg-primary',
                )}
              />
              <item.icon className="size-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}