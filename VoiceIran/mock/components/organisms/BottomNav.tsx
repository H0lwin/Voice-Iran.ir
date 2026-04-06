"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Home, 
  Newspaper, 
  Shield, 
  Users, 
  Search,
  Folder
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'خانه', icon: Home },
  { href: '/news', label: 'اخبار', icon: Newspaper },
  { href: '/arsenal', label: 'تسلیحات', icon: Shield },
  { href: '/martyrs', label: 'شهدا', icon: Users },
  { href: '/documents', label: 'مستندات', icon: Folder },
]

export function BottomNav() {
  const pathname = usePathname()

  // Don't show on search page
  if (pathname === '/search') return null

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-ink)]/95 backdrop-blur-xl border-t border-[var(--color-ink-border)] safe-area-bottom"
      role="navigation"
      aria-label="منوی اصلی"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className="relative flex flex-col items-center gap-1"
                whileTap={{ scale: 0.9 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[var(--color-gold)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <div className={`
                  p-2 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'text-[var(--color-gold)] bg-[var(--color-gold)]/10' 
                    : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'
                  }
                `}>
                  <Icon 
                    className="w-5 h-5" 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                
                <span className={`
                  text-[10px] font-medium transition-colors duration-200
                  ${isActive 
                    ? 'text-[var(--color-gold)]' 
                    : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'
                  }
                `}>
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
