"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  Newspaper,
  Shield,
  Users,
  Folder,
  ChevronLeft
} from 'lucide-react'
import { AppShell } from '@/components/organisms/AppShell'
import { Input } from '@/components/ui/input'
import { toPersianNumber } from '@/lib/persian-utils'

// All searchable content
const searchableContent = {
  news: [
    { id: '1', title: 'عملیات موفق پدافند هوایی', type: 'news', category: 'نظامی', image: 'https://picsum.photos/seed/s-1/200/200' },
    { id: '2', title: 'رونمایی از سامانه رادار بومی', type: 'news', category: 'فناوری', image: 'https://picsum.photos/seed/s-2/200/200' },
    { id: '3', title: 'تحلیل وضعیت امنیتی منطقه', type: 'news', category: 'تحلیل', image: 'https://picsum.photos/seed/s-3/200/200' },
  ],
  weapons: [
    { id: 'fattah', title: 'موشک فتاح', type: 'weapon', category: 'موشک بالستیک', image: 'https://picsum.photos/seed/w-1/200/200' },
    { id: 'shahed', title: 'پهپاد شاهد ۱۳۶', type: 'weapon', category: 'پهپاد', image: 'https://picsum.photos/seed/w-2/200/200' },
    { id: 'bavar', title: 'سامانه باور ۳۷۳', type: 'weapon', category: 'پدافند', image: 'https://picsum.photos/seed/w-3/200/200' },
  ],
  martyrs: [
    { id: '1', title: 'شهید سردار قاسم سلیمانی', type: 'martyr', category: 'سپاه قدس', image: 'https://picsum.photos/seed/m-1/200/200' },
    { id: '2', title: 'شهید محسن فخری‌زاده', type: 'martyr', category: 'دانشمند هسته‌ای', image: 'https://picsum.photos/seed/m-2/200/200' },
  ],
  documents: [
    { id: '1', title: 'مستند عملیات وعده صادق', type: 'document', category: 'ویدیو', image: 'https://picsum.photos/seed/d-1/200/200' },
    { id: '2', title: 'گزارش سالانه دفاعی', type: 'document', category: 'PDF', image: 'https://picsum.photos/seed/d-2/200/200' },
  ],
}

const allContent = [
  ...searchableContent.news,
  ...searchableContent.weapons,
  ...searchableContent.martyrs,
  ...searchableContent.documents,
]

// Recent searches (would be from localStorage in real app)
const recentSearches = [
  'موشک فتاح',
  'پدافند هوایی',
  'شهید سلیمانی',
  'پهپاد شاهد',
]

// Popular searches
const popularSearches = [
  'عملیات وعده صادق',
  'سامانه باور',
  'نیروی دریایی',
  'تسلیحات بالستیک',
  'رزمایش',
  'دفاع سایبری',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [recentHistory, setRecentHistory] = useState(recentSearches)

  const results = useMemo(() => {
    if (!query.trim()) return []
    
    return allContent.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  const clearRecent = (term: string) => {
    setRecentHistory(prev => prev.filter(t => t !== term))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return Newspaper
      case 'weapon': return Shield
      case 'martyr': return Users
      case 'document': return Folder
      default: return Newspaper
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'news': return 'خبر'
      case 'weapon': return 'تسلیحات'
      case 'martyr': return 'شهید'
      case 'document': return 'مستند'
      default: return ''
    }
  }

  const getTypeHref = (item: typeof allContent[0]) => {
    switch (item.type) {
      case 'news': return `/news/${item.id}`
      case 'weapon': return `/arsenal/${item.id}`
      case 'martyr': return `/martyrs/${item.id}`
      case 'document': return `/documents/${item.id}`
      default: return '/'
    }
  }

  return (
    <AppShell hideNav>
      {/* Search Input */}
      <div className="px-4 pt-4 pb-2 sticky top-14 bg-[var(--color-ink)] z-30">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
          <Input
            type="text"
            placeholder="جستجو در سامانه دفاعی..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pr-10 pl-10 py-6 text-lg bg-[var(--color-ink-raised)] border-[var(--color-ink-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] rounded-xl"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-[var(--color-text-tertiary)]" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {query ? (
            /* Search Results */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                {toPersianNumber(results.length)} نتیجه برای "{query}"
              </p>

              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((item, index) => {
                    const Icon = getTypeIcon(item.type)
                    return (
                      <motion.div
                        key={`${item.type}-${item.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={getTypeHref(item)}>
                          <div className="flex items-center gap-3 p-3 bg-[var(--color-ink-raised)] rounded-xl border border-[var(--color-ink-border)] hover:border-[var(--color-gold)]/50 transition-colors">
                            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={item.image}
                                alt={item.title}
                                width={56}
                                height={56}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                                <span className="text-xs text-[var(--color-gold)]">{getTypeLabel(item.type)}</span>
                              </div>
                              <h3 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-[var(--color-text-tertiary)]">{item.category}</p>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--color-text-secondary)]">نتیجه‌ای یافت نشد</p>
                  <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                    عبارت دیگری را جستجو کنید
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Default State */
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Recent Searches */}
              {recentHistory.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      جستجوهای اخیر
                    </h2>
                    <button 
                      onClick={() => setRecentHistory([])}
                      className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-gold)]"
                    >
                      پاک کردن همه
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentHistory.map((term) => (
                      <div 
                        key={term}
                        className="flex items-center justify-between p-3 bg-[var(--color-ink-raised)] rounded-xl"
                      >
                        <button
                          onClick={() => setQuery(term)}
                          className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        >
                          <Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                          <span className="text-sm">{term}</span>
                        </button>
                        <button 
                          onClick={() => clearRecent(term)}
                          className="p-1"
                        >
                          <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <h2 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  جستجوهای پرطرفدار
                </h2>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] text-sm hover:bg-[var(--color-ink-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8">
                <h2 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">دسترسی سریع</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { href: '/news', label: 'اخبار', icon: Newspaper, color: 'from-blue-600 to-blue-800' },
                    { href: '/arsenal', label: 'تسلیحات', icon: Shield, color: 'from-emerald-600 to-emerald-800' },
                    { href: '/martyrs', label: 'شهدا', icon: Users, color: 'from-red-700 to-red-900' },
                    { href: '/documents', label: 'مستندات', icon: Folder, color: 'from-amber-600 to-amber-800' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href}>
                        <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${item.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                          <span className="text-white font-medium">{item.label}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
