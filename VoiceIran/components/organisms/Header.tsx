'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_ITEMS, SITE_INFO } from '@/lib/constants'
import { CurrentDate } from '@/components/atoms/PersianDate'
import { cn } from '@/lib/utils'
import { Search, Menu, X, Sun, Moon, Zap } from 'lucide-react'

interface HeaderProps {
  breakingNews?: Array<{ id: string; title: string; href: string }>
}

export function Header({ breakingNews = [] }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
          isScrolled
            ? 'h-14 bg-[rgba(13,27,46,0.92)] backdrop-blur-lg'
            : 'h-20 bg-transparent'
        )}
      >
        <div className="h-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
          {/* Logo and Site Name */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dim)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--color-ink)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
                {SITE_INFO.shortName}
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative py-2 text-sm font-medium transition-colors group"
                >
                  <span className={cn(
                    'transition-colors',
                    isActive ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 right-0 left-0 h-0.5 bg-[var(--color-gold)]"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Section: Search, Date, Theme */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-ink-raised)] transition-colors"
              aria-label="جستجو"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Current Date - Hidden on mobile */}
            <div className="hidden md:block border-r border-[var(--color-ink-border)] pr-4">
              <CurrentDate />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-ink-raised)] transition-colors"
              aria-label={theme === 'dark' ? 'تم روشن' : 'تم تاریک'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-ink-raised)] transition-colors"
              aria-label={isMobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--color-ink)] lg:hidden"
          >
            <div className="pt-24 px-8">
              <nav className="flex flex-col gap-4">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = pathname === item.href
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'block text-2xl font-bold py-3 border-b border-[var(--color-ink-border)]',
                          isActive ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-primary)]'
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* Mobile Date */}
              <div className="mt-8 pt-8 border-t border-[var(--color-ink-border)]">
                <CurrentDate className="text-lg" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="fixed top-20 right-0 left-0 z-40 bg-[var(--color-crimson)] text-[var(--color-text-primary)] overflow-hidden">
          <div className="flex items-center h-10">
            <div className="flex-shrink-0 px-4 bg-[rgba(0,0,0,0.2)] h-full flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">فوری</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="animate-ticker whitespace-nowrap flex">
                {[...breakingNews, ...breakingNews].map((news, i) => (
                  <Link
                    key={`${news.id}-${i}`}
                    href={news.href}
                    className="inline-block px-8 text-sm hover:underline"
                  >
                    {news.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
