"use client"

import {useEffect, useMemo, useState, type KeyboardEvent} from "react"
import Link from "next/link"
import Image from "next/image"
import {AppShell} from "@/components/organisms/AppShell"
import {Input} from "@/components/ui/input"
import {Clock, Folder, Newspaper, Search, Shield, TrendingUp, Users, X} from "lucide-react"
import {useLocale, useTranslations} from "next-intl"
import {formatNumberByLocale} from "@/lib/i18n"
import {getSearchMeta, searchUnified, type UnifiedSearchResult} from "@/lib/api"

type SearchResult = {
  id: string
  title: string
  category?: string
  type: string
  image?: string
}

const recentStorageKey = "voiceiran_recent_searches"

export default function SearchPageClient() {
  const locale = useLocale() as "fa" | "en"
  const t = useTranslations("search")
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<SearchResult[]>([])
  const [popular, setPopular] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(recentStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as string[]
      setRecent(parsed.slice(0, 8))
    } catch {
      setRecent([])
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      const data = await getSearchMeta(locale)
      setPopular(data.popular_terms || [])
    }
    run()
  }, [locale])

  useEffect(() => {
    const run = async () => {
      if (!query.trim()) {
        setItems([])
        setLoading(false)
        return
      }
      setLoading(true)
      const results = await searchUnified(locale, query, 30)
      const mapped: SearchResult[] = results.map((entry: UnifiedSearchResult) => ({
        id: String(entry.id),
        title: entry.title,
        category: entry.category || "",
        type: entry.type,
        image: entry.image,
      }))
      setItems(mapped)
      setLoading(false)
    }
    const timer = setTimeout(run, 250)
    return () => clearTimeout(timer)
  }, [locale, query])

  const onSearch = (value: string) => {
    setQuery(value)
  }

  const saveRecent = (value: string) => {
    const term = value.trim()
    if (!term) return
    const next = [term, ...recent.filter((item) => item !== term)].slice(0, 8)
    setRecent(next)
    localStorage.setItem(recentStorageKey, JSON.stringify(next))
  }

  const removeRecent = (term: string) => {
    const next = recent.filter((item) => item !== term)
    setRecent(next)
    localStorage.setItem(recentStorageKey, JSON.stringify(next))
  }

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveRecent(query)
  }

  const countLabel = useMemo(() => t("results", {count: formatNumberByLocale(items.length, locale)}), [items.length, locale, t])

  return (
    <AppShell hideNav>
      <div className="px-4 pt-4 pb-2 sticky top-14 bg-[var(--color-ink)] z-30">
        <div className="relative max-w-4xl mx-auto w-full">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)] pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={onEnter}
            placeholder={t("placeholder")}
            className="w-full ps-10 pe-10 py-6 text-lg bg-[var(--color-ink-raised)] border-[var(--color-ink-border)] rounded-xl"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute start-3 top-1/2 -translate-y-1/2" aria-label="Clear">
              <X className="w-5 h-5 text-[var(--color-text-tertiary)]" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 max-w-4xl mx-auto w-full">
        {query.trim() ? (
          <div>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-4">{countLabel}</p>
            {loading ? <p className="text-[var(--color-text-tertiary)]">{t("loading")}</p> : null}
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={hrefFor(item.type, item.id, locale)}
                    onClick={() => saveRecent(query)}
                    className="flex items-center gap-3 p-3 bg-[var(--color-ink-raised)] rounded-xl border border-[var(--color-ink-border)] hover:border-[var(--color-gold)]/50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-ink-muted)]">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-gold)]">{labelForType(item.type, locale)}</p>
                      <h3 className="text-sm font-medium text-[var(--color-text-primary)] truncate">{item.title}</h3>
                      <p className="text-xs text-[var(--color-text-tertiary)]">{item.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-text-secondary)]">{t("noResults")}</p>
            )}
          </div>
        ) : (
          <div>
            {recent.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {locale === "fa" ? "جستجوهای اخیر" : "Recent Searches"}
                  </h2>
                  <button
                    onClick={() => {
                      setRecent([])
                      localStorage.removeItem(recentStorageKey)
                    }}
                    className="text-xs text-[var(--color-text-tertiary)]"
                  >
                    {locale === "fa" ? "پاک کردن همه" : "Clear all"}
                  </button>
                </div>
                <div className="space-y-2">
                  {recent.map((term) => (
                    <div key={term} className="flex items-center justify-between p-3 bg-[var(--color-ink-raised)] rounded-xl">
                      <button onClick={() => setQuery(term)} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                        <Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                        <span className="text-sm">{term}</span>
                      </button>
                      <button onClick={() => removeRecent(term)} className="p-1">
                        <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" />
                {locale === "fa" ? "جستجوهای پرطرفدار" : "Popular Searches"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {popular.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term)
                      saveRecent(term)
                    }}
                    className="px-4 py-2 rounded-full bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] text-sm hover:bg-[var(--color-ink-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                {locale === "fa" ? "دسترسی سریع" : "Quick Links"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks(locale).map((item) => (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${item.color}`}>
                    <item.icon className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function labelForType(type: string, locale: "fa" | "en") {
  if (type === "posts" || type === "news") return locale === "fa" ? "خبر" : "News"
  if (type === "weapons" || type === "weapon") return locale === "fa" ? "تسلیحات" : "Arsenal"
  if (type === "martyrs" || type === "martyr") return locale === "fa" ? "شهید" : "Martyr"
  if (type === "documents" || type === "document") return locale === "fa" ? "مستند" : "Document"
  return type
}

function hrefFor(type: string, id: string, locale: "fa" | "en") {
  if (type === "posts" || type === "news") return `/${locale}/news/${id}`
  if (type === "weapons" || type === "weapon") return `/${locale}/arsenal/${id}`
  if (type === "martyrs" || type === "martyr") return `/${locale}/martyrs/${id}`
  if (type === "documents" || type === "document") return `/${locale}/documents/${id}`
  return `/${locale}`
}

function quickLinks(locale: "fa" | "en") {
  return [
    {href: `/${locale}/news`, label: locale === "fa" ? "اخبار" : "News", icon: Newspaper, color: "from-blue-600 to-blue-800"},
    {href: `/${locale}/arsenal`, label: locale === "fa" ? "تسلیحات" : "Arsenal", icon: Shield, color: "from-emerald-600 to-emerald-800"},
    {href: `/${locale}/martyrs`, label: locale === "fa" ? "شهدا" : "Martyrs", icon: Users, color: "from-red-700 to-red-900"},
    {href: `/${locale}/documents`, label: locale === "fa" ? "مستندات" : "Documents", icon: Folder, color: "from-amber-600 to-amber-800"},
  ]
}
