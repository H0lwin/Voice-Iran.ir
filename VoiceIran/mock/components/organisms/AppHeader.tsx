"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Moon, Sun, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toPersianDate, persianWeekDay } from '@/lib/persian-utils'

interface AppHeaderProps {
  title?: string
  showBack?: boolean
  transparent?: boolean
}

export function AppHeader({ title, showBack, transparent = false }: AppHeaderProps) {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
      html.setAttribute('data-theme', savedTheme)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const today = new Date()
  const persianDate = toPersianDate(today)
  const weekDay = persianWeekDay(today)

  const isHome = pathname === '/'
  const pageTitle = title || getPageTitle(pathname)

  const notifications = [
    { id: 1, title: 'عملیات موفق پدافند هوایی', time: '۵ دقیقه پیش', unread: true },
    { id: 2, title: 'رونمایی از سامانه جدید موشکی', time: '۱ ساعت پیش', unread: true },
    { id: 3, title: 'تمرین مشترک نیروی دریایی', time: '۳ ساعت پیش', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <>
      <header 
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${hasScrolled || !transparent 
            ? 'bg-[var(--color-ink)]/95 backdrop-blur-xl border-b border-[var(--color-ink-border)]' 
            : 'bg-transparent'
          }
        `}
      >
        <div className="safe-area-top" />
        
        <div className="flex items-center justify-between h-14 px-4">
          {/* Right side - Back or Logo */}
          <div className="flex items-center gap-3 flex-1">
            {showBack ? (
              <Link 
                href="/" 
                className="flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="text-sm">بازگشت</span>
              </Link>
            ) : isHome ? (
              <div className="flex flex-col">
                <span className="text-xs text-[var(--color-text-tertiary)]">{weekDay}</span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{persianDate}</span>
              </div>
            ) : (
              <h1 className="text-lg font-bold text-[var(--color-text-primary)]">{pageTitle}</h1>
            )}
          </div>

          {/* Center - Logo on home */}
          {isHome && (
            <div className="absolute left-1/2 -translate-x-1/2">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dim)] flex items-center justify-center">
                  <span className="text-[var(--color-ink)] font-bold text-sm">دفاع</span>
                </div>
              </Link>
            </div>
          )}

          {/* Left side - Actions */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Link href="/search">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">جستجو</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-crimson)] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">اعلان‌ها</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="sr-only">تغییر تم</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-16 left-4 right-4 z-50 bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)] rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-ink-border)]">
                <h3 className="font-bold text-[var(--color-text-primary)]">اعلان‌ها</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`
                      p-4 border-b border-[var(--color-ink-border)] last:border-0
                      ${notification.unread ? 'bg-[var(--color-gold)]/5' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {notification.unread && (
                        <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] mt-2 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-[var(--color-text-primary)]">{notification.title}</p>
                        <span className="text-xs text-[var(--color-text-tertiary)]">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/news': 'اخبار',
    '/arsenal': 'تسلیحات',
    '/martyrs': 'شهدا',
    '/documents': 'مستندات',
    '/search': 'جستجو',
  }
  return titles[pathname] || 'سامانه دفاعی'
}
