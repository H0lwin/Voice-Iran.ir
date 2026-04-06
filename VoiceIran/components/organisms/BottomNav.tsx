"use client"

import {usePathname} from "next/navigation"
import Link from "next/link"
import {motion} from "framer-motion"
import {Folder, Home, Newspaper, Shield, Users} from "lucide-react"
import {useLocale, useTranslations} from "next-intl"

export function BottomNav() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()

  const items = [
    {href: `/${locale}`, label: t("home"), icon: Home},
    {href: `/${locale}/news`, label: t("news"), icon: Newspaper},
    {href: `/${locale}/arsenal`, label: t("arsenal"), icon: Shield},
    {href: `/${locale}/martyrs`, label: t("martyrs"), icon: Users},
    {href: `/${locale}/documents`, label: t("documents"), icon: Folder},
  ]

  if (pathname.endsWith("/search")) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-ink)]/95 backdrop-blur-xl border-t border-[var(--color-ink-border)] safe-area-bottom"
      aria-label="Primary"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon
          const isHomeItem = item.href === `/${locale}`
          const isActive = isHomeItem
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                className="relative flex flex-col items-center gap-1"
                whileTap={{scale: 0.9}}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[var(--color-gold)]"
                    transition={{type: "spring", stiffness: 500, damping: 30}}
                  />
                )}
                <div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                      : "text-[var(--color-text-tertiary)]"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-[var(--color-gold)]" : "text-[var(--color-text-tertiary)]"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
