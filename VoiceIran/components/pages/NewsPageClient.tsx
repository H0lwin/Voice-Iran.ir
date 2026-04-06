"use client"

import {useMemo, useState} from "react"
import Image from "next/image"
import Link from "next/link"
import {AnimatePresence, motion} from "framer-motion"
import {AppShell} from "@/components/organisms/AppShell"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Bookmark, Clock, Eye, Filter, Search, TrendingUp, X} from "lucide-react"
import {formatDateByLocale, formatNumberByLocale} from "@/lib/i18n"
import type {AppLocale} from "@/i18n/routing"
import type {NewsOverviewPayload, Post} from "@/lib/api"

type Props = {
  locale: AppLocale
  data: NewsOverviewPayload
}

const copy = {
  fa: {
    searchPlaceholder: "جستجو در اخبار...",
    category: "دسته‌بندی",
    resultsFound: "خبر یافت شد",
    noResultTitle: "خبری یافت نشد",
    noResultDesc: "عبارت جستجو را تغییر دهید",
    live: "زنده",
    minute: "دقیقه",
  },
  en: {
    searchPlaceholder: "Search news...",
    category: "Category",
    resultsFound: "items found",
    noResultTitle: "No news found",
    noResultDesc: "Try another query",
    live: "LIVE",
    minute: "min",
  },
} as const

export function NewsPageClient({locale, data}: Props) {
  const t = copy[locale]
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>([])

  const filtered = useMemo(() => {
    return data.items.filter((item) => {
      const matchesQuery =
        !query.trim() ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.excerpt || "").toLowerCase().includes(query.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" || item.category_slug === selectedCategory
      return matchesQuery && matchesCategory
    })
  }, [data.filters.categories, data.items, query, selectedCategory])

  const featured = data.featured && filtered.some((x) => x.id === data.featured?.id) ? data.featured : filtered.find((x) => x.is_featured)
  const listed = filtered.filter((item) => item.id !== featured?.id)

  const toggleSave = (id: string | number) => {
    const key = String(id)
    setSavedIds((prev) => (prev.includes(key) ? prev.filter((value) => value !== key) : [...prev, key]))
  }

  return (
    <AppShell>
      <div className="px-4 pt-4 pb-3 sticky top-14 bg-[var(--color-ink)] z-30">
        <div className="w-full">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)] pointer-events-none" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full ps-10 pe-10 bg-[var(--color-ink-raised)] border-[var(--color-ink-border)]"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute start-3 top-1/2 -translate-y-1/2" aria-label="Clear">
                <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters((prev) => !prev)}
            className={showFilters ? "bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)]" : "border-[var(--color-ink-border)]"}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {!query.trim() && data.trending_terms.length > 0 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
            <TrendingUp className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
            {data.trending_terms.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1 rounded-full bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] text-xs whitespace-nowrap hover:bg-[var(--color-ink-muted)] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2}}
            className="overflow-hidden border-b border-[var(--color-ink-border)]"
          >
            <div className="px-4 py-3">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{t.category}</p>
              <div className="flex flex-wrap gap-2">
                {data.filters.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? "px-3 py-1.5 rounded-full text-sm bg-[var(--color-gold)] text-[var(--color-ink)]" : "px-3 py-1.5 rounded-full text-sm bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)]"}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 py-3 max-w-6xl mx-auto w-full">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          {formatNumberByLocale(filtered.length, locale)} {t.resultsFound}
        </p>
      </div>

      {featured && !query.trim() && <FeaturedCard locale={locale} item={featured} liveLabel={t.live} />}

      <div className="px-4 pb-8 space-y-4 max-w-6xl mx-auto w-full">
        {listed.map((news) => {
          const saved = savedIds.includes(String(news.id)) || Boolean(news.is_bookmarked)
          return (
            <article key={String(news.id)} className="flex gap-3 bg-[var(--color-ink-raised)] rounded-xl p-3 border border-[var(--color-ink-border)] card-hover">
              <Link href={`/${locale}/news/${news.slug || news.id}`} className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                <Image src={news.image || "/images/placeholder-media.svg"} alt={news.title} fill className="object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-[var(--color-gold)]">{news.category_label || ""}</span>
                    <Link href={`/${locale}/news/${news.slug || news.id}`} className="block text-sm font-bold text-[var(--color-text-primary)] line-clamp-2 mt-1">{news.title}</Link>
                  </div>
                  <button onClick={() => toggleSave(news.id)} className="p-1 shrink-0">
                    <Bookmark className={saved ? "w-4 h-4 fill-[var(--color-gold)] text-[var(--color-gold)]" : "w-4 h-4 text-[var(--color-text-tertiary)]"} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {news.published_at ? formatDateByLocale(news.published_at, locale) : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumberByLocale(news.views || 0, locale)}
                  </span>
                  <span>{formatNumberByLocale(news.reading_time || 0, locale)} {t.minute}</span>
                </div>
              </div>
            </article>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)]">{t.noResultTitle}</p>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">{t.noResultDesc}</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function FeaturedCard({locale, item, liveLabel}: {locale: AppLocale; item: Post; liveLabel: string}) {
  return (
    <div className="px-4 pb-4 max-w-6xl mx-auto w-full">
      <Link href={`/${locale}/news/${item.slug || item.id}`} className="block relative rounded-2xl overflow-hidden">
        <div className="relative aspect-[16/9]">
          <Image src={item.image || "/images/placeholder-media.svg"} alt={item.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          {item.is_live && (
            <div className="absolute top-4 end-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-crimson)] text-white text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {liveLabel}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--color-gold)]/90 text-[var(--color-ink)] text-xs font-medium mb-2">
              {item.category_label || ""}
            </span>
            <h2 className="text-lg font-bold text-white mb-2 line-clamp-2">{item.title}</h2>
            <div className="flex items-center gap-4 text-white/70 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.published_at ? formatDateByLocale(item.published_at, locale) : ""}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatNumberByLocale(item.views || 0, locale)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
