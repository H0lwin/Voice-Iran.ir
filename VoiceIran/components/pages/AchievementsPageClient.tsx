"use client"

import {useMemo, useState} from "react"
import Image from "next/image"
import Link from "next/link"
import {AnimatePresence, motion} from "framer-motion"
import {AppShell} from "@/components/organisms/AppShell"
import {Input} from "@/components/ui/input"
import {Clock, Filter, Search, Shield, Target, TrendingUp, X} from "lucide-react"
import type {AchievementItem} from "@/lib/api"
import type {AppLocale} from "@/i18n/routing"
import {formatDateByLocale, formatNumberByLocale} from "@/lib/i18n"

type Props = {
  locale: AppLocale
  items: AchievementItem[]
}

const copy = {
  fa: {
    title: "دستاوردها",
    search: "جستجو در دستاوردها...",
    all: "همه",
    targetType: "نوع هدف",
    found: "دستاورد یافت شد",
    noResult: "دستاوردی یافت نشد",
  },
  en: {
    title: "Achievements",
    search: "Search achievements...",
    all: "All",
    targetType: "Target Type",
    found: "achievements found",
    noResult: "No achievements found",
  },
} as const

export function AchievementsPageClient({locale, items}: Props) {
  const t = copy[locale]
  const [query, setQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [targetType, setTargetType] = useState("all")

  const targetTypes = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      if (item.target_type) {
        map.set(item.target_type, item.target_type_label || item.target_type)
      }
    }
    return [{id: "all", label: t.all}, ...Array.from(map.entries()).map(([id, label]) => ({id, label}))]
  }, [items, t.all])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = query.trim().toLowerCase()
      const queryMatch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.excerpt || "").toLowerCase().includes(q) ||
        (item.region || "").toLowerCase().includes(q)
      const typeMatch = targetType === "all" || item.target_type === targetType
      return queryMatch && typeMatch
    })
  }, [items, query, targetType])

  const featured = filtered.find((x) => x.is_featured) || filtered[0]
  const list = filtered.filter((x) => x.id !== featured?.id)

  return (
    <AppShell headerTitle={t.title}>
      <div className="px-4 pt-4 pb-3 sticky top-14 bg-[var(--color-ink)] z-30">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)] pointer-events-none" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} className="w-full ps-10 pe-10 bg-[var(--color-ink-raised)] border-[var(--color-ink-border)]" />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute start-3 top-1/2 -translate-y-1/2" aria-label="Clear">
                  <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilters((v) => !v)} className={showFilters ? "h-10 px-3 rounded-xl bg-[var(--color-gold)] text-[var(--color-ink)]" : "h-10 px-3 rounded-xl bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)]"}>
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {!query.trim() && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
              <TrendingUp className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
              {targetTypes.slice(1, 6).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTargetType(item.id)}
                  className="px-3 py-1 rounded-full bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] text-xs whitespace-nowrap hover:bg-[var(--color-ink-muted)] transition-colors"
                >
                  {item.label}
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
            <div className="px-4 py-3 max-w-6xl mx-auto w-full">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{t.targetType}</p>
              <div className="flex flex-wrap gap-2">
                {targetTypes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTargetType(item.id)}
                    className={
                      targetType === item.id
                        ? "px-3 py-1.5 rounded-full text-sm bg-[var(--color-gold)] text-[var(--color-ink)]"
                        : "px-3 py-1.5 rounded-full text-sm bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)]"
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 py-3 max-w-6xl mx-auto w-full">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          {formatNumberByLocale(filtered.length, locale)} {t.found}
        </p>
      </div>

      {featured ? (
        <div className="px-4 pb-4 max-w-6xl mx-auto w-full">
          <Link href={`/${locale}/achievements/${featured.slug || featured.id}`} className="block rounded-2xl overflow-hidden card-hover">
            <div className="relative aspect-[16/9]">
              <Image src={featured.image || "/images/placeholder-media.svg"} alt={featured.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4">
                <div className="flex items-center gap-2 mb-2">
                  {featured.target_type_label ? <span className="px-2 py-0.5 rounded bg-[var(--color-gold)]/90 text-[var(--color-ink)] text-xs">{featured.target_type_label}</span> : null}
                  {featured.verification_status_label ? <span className="px-2 py-0.5 rounded bg-black/40 text-white text-xs">{featured.verification_status_label}</span> : null}
                </div>
                <h2 className="text-lg font-bold text-white line-clamp-2 mb-1">{featured.title}</h2>
                <div className="flex items-center gap-3 text-white/75 text-xs">
                  {featured.published_at ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateByLocale(featured.published_at, locale)}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {formatNumberByLocale(featured.destroyed_targets_count || 0, locale)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {formatNumberByLocale(featured.strategic_gain_count || 0, locale)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ) : null}

      <div className="px-4 pb-8 space-y-4 max-w-6xl mx-auto w-full">
        {list.map((item) => (
          <article key={String(item.id)} className="flex gap-3 bg-[var(--color-ink-raised)] rounded-xl p-3 border border-[var(--color-ink-border)] card-hover">
            <Link href={`/${locale}/achievements/${item.slug || item.id}`} className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
              <Image src={item.image || "/images/placeholder-media.svg"} alt={item.title} fill className="object-cover" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-[var(--color-gold)]">{item.target_type_label || ""}</span>
                  <Link href={`/${locale}/achievements/${item.slug || item.id}`} className="block text-sm font-bold text-[var(--color-text-primary)] line-clamp-2 mt-1">{item.title}</Link>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1 line-clamp-1">{item.region || ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)]">
                {item.published_at ? <span>{formatDateByLocale(item.published_at, locale)}</span> : null}
                <span>{formatNumberByLocale(item.destroyed_targets_count || 0, locale)}</span>
                <span>{formatNumberByLocale(item.strategic_gain_count || 0, locale)}</span>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && <p className="text-[var(--color-text-secondary)]">{t.noResult}</p>}
      </div>
    </AppShell>
  )
}
