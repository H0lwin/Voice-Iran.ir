"use client"

import {useMemo, useState} from "react"
import Image from "next/image"
import Link from "next/link"
import {AppShell} from "@/components/organisms/AppShell"
import {Button} from "@/components/ui/button"
import {ChevronLeft, ChevronRight, Crosshair, Info, Plane, Radio, Rocket, Shield, Ship, Target, X, Zap} from "lucide-react"
import type {LucideIcon} from "lucide-react"
import {formatNumberByLocale, isRtlLocale} from "@/lib/i18n"
import type {AppLocale} from "@/i18n/routing"
import type {ArsenalOverviewPayload, Weapon} from "@/lib/api"

type Props = {
  locale: AppLocale
  data: ArsenalOverviewPayload
}

const copy = {
  fa: {
    title: "آرسنال دفاعی",
    description: "مروری بر تسلیحات پیشرفته جمهوری اسلامی ایران",
    systems: "تعداد سامانه",
    operational: "عملیاتی",
    range: "برد عملیاتی",
    kilometer: "کیلومتر",
    close: "بستن",
    details: "اطلاعات کامل",
  },
  en: {
    title: "Defense Arsenal",
    description: "Overview of advanced defense systems",
    systems: "Systems",
    operational: "Operational",
    range: "Range",
    kilometer: "km",
    close: "Close",
    details: "Full Details",
  },
} as const

function categoryIcon(id: string): LucideIcon {
  const map: Record<string, LucideIcon> = {
    all: Shield,
    missiles: Rocket,
    drones: Plane,
    naval: Ship,
    radar: Radio,
    defense: Target,
  }
  return map[id] ?? Shield
}

export function ArsenalPageClient({locale, data}: Props) {
  const t = copy[locale]
  const isRtl = isRtlLocale(locale)
  const ChevronAffordance = isRtl ? ChevronLeft : ChevronRight
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null)

  const filtered = useMemo(
    () =>
      selectedCategory === "all"
        ? data.items
        : data.items.filter((item) => item.category_slug === selectedCategory),
    [data.items, selectedCategory],
  )

  return (
    <AppShell>
      <div className="px-4 pt-4 pb-2 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{t.title}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{t.description}</p>
      </div>

      <div className="px-4 py-3 max-w-6xl mx-auto w-full">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {data.filters.categories.map((cat) => {
            const Icon = categoryIcon(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={
                  selectedCategory === cat.id
                    ? "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap bg-[var(--color-gold)] text-[var(--color-ink)]"
                    : "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-ink-muted)]"
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[var(--color-gold)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)]">{t.systems}</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatNumberByLocale(filtered.length, locale)}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--color-ink-border)]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-emerald)]/10 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-[var(--color-emerald-light)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)]">{t.operational}</p>
              <p className="text-lg font-bold text-[var(--color-emerald-light)]">{formatNumberByLocale(data.stats.operational, locale)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((weapon) => (
            <button key={String(weapon.id)} onClick={() => setSelectedWeapon(weapon)} className="w-full text-start group">
              <article className="relative rounded-2xl overflow-hidden bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)] card-hover">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={weapon.image || "/images/placeholder-media.svg"}
                    alt={weapon.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-transparent" />
                  {weapon.status_label && (
                    <div className="absolute top-3 end-3">
                      <span className="px-2 py-1 rounded-full bg-[var(--color-emerald)]/90 text-white text-xs font-medium">{weapon.status_label}</span>
                    </div>
                  )}
                  {weapon.year != null && (
                    <div className="absolute top-3 start-3">
                      <span className="px-2 py-1 rounded-full bg-black/50 text-white text-xs">{formatNumberByLocale(weapon.year, locale)}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-gold)] transition-colors">{weapon.name}</h3>
                      {weapon.name_en ? <p className="text-xs text-[var(--color-text-tertiary)] truncate">{weapon.name_en}</p> : null}
                    </div>
                    <ChevronAffordance className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-gold)] transition-colors shrink-0" aria-hidden />
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">{weapon.type || ""}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(weapon.features || []).map((feature) => (
                      <span key={feature} className="px-2 py-0.5 rounded-full bg-[var(--color-ink-muted)] text-[var(--color-text-secondary)] text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-ink-border)]">
                    <span className="text-xs text-[var(--color-text-tertiary)]">{t.range}</span>
                    <span className="text-sm font-bold text-[var(--color-gold)]">
                      {formatNumberByLocale(weapon.range || 0, locale)} {t.kilometer}
                    </span>
                  </div>
                </div>
              </article>
            </button>
          ))}
        </div>
      </div>

      {selectedWeapon && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedWeapon(null)} />
          <div className="absolute inset-x-0 bottom-0 bg-[var(--color-ink)] rounded-t-3xl max-h-[90vh] overflow-y-auto sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:start-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[min(760px,88vw)] sm:max-h-[82vh] sm:rounded-2xl">
            <div className="sticky top-0 bg-[var(--color-ink)] pt-3 pb-2 flex justify-center sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[var(--color-ink-muted)]" />
            </div>
            <button
              type="button"
              onClick={() => setSelectedWeapon(null)}
              className="absolute top-4 end-4 w-8 h-8 rounded-full bg-[var(--color-ink-raised)] flex items-center justify-center"
            >
              <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </button>
            <div className="relative aspect-[16/9] mx-4 mt-1 sm:mt-4 rounded-2xl overflow-hidden">
              <Image src={selectedWeapon.image || "/images/placeholder-media.svg"} alt={selectedWeapon.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] to-transparent" />
              {selectedWeapon.status_label ? (
                <div className="absolute bottom-4 end-4">
                  <span className="px-3 py-1.5 rounded-full bg-[var(--color-emerald)] text-white text-sm font-medium">{selectedWeapon.status_label}</span>
                </div>
              ) : null}
            </div>
            <div className="px-4 py-6">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{selectedWeapon.name}</h2>
                {selectedWeapon.year != null ? (
                  <span className="px-3 py-1 rounded-full bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] text-sm shrink-0">
                    {formatNumberByLocale(selectedWeapon.year, locale)}
                  </span>
                ) : null}
              </div>
              {selectedWeapon.name_en ? <p className="text-sm text-[var(--color-text-tertiary)] mb-2">{selectedWeapon.name_en}</p> : null}
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">{selectedWeapon.type || ""}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">{selectedWeapon.description || ""}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{t.range}</p>
                  <p className="text-xl font-bold text-[var(--color-gold)]">
                    {formatNumberByLocale(selectedWeapon.range || 0, locale)} {t.kilometer}
                  </p>
                </div>
                {(selectedWeapon.specs || []).slice(0, 3).map((spec) => (
                  <div key={`${spec.key}-${spec.value}`} className="p-4 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{spec.key}</p>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                      {spec.value}
                      {spec.unit ? ` ${spec.unit}` : ""}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button asChild className="flex-1 bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-[var(--color-ink)]">
                  <Link href={`/${locale}/arsenal/${selectedWeapon.slug || selectedWeapon.id}`}>
                    <Info className="w-4 h-4 me-2" />
                    {t.details}
                  </Link>
                </Button>
                <Button variant="outline" className="border-[var(--color-ink-border)]" onClick={() => setSelectedWeapon(null)}>
                  {t.close}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
