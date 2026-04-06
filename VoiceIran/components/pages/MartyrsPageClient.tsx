"use client"

import {useMemo, useState} from "react"
import Image from "next/image"
import Link from "next/link"
import {AppShell} from "@/components/organisms/AppShell"
import {Button} from "@/components/ui/button"
import {Award, Calendar, Heart, MapPin, X} from "lucide-react"
import {formatDateByLocale, formatNumberByLocale} from "@/lib/i18n"
import type {AppLocale} from "@/i18n/routing"
import type {Martyr, MartyrsOverviewPayload} from "@/lib/api"

type Props = {
  locale: AppLocale
  data: MartyrsOverviewPayload
}

const copy = {
  fa: {
    verse: "«وَ لا تَحْسَبَنَّ الَّذینَ قُتِلُوا فی سَبیلِ اللَّهِ أَمْواتاً بَلْ أَحْیاءٌ عِنْدَ رَبِّهِمْ یُرْزَقُونَ»",
    verseRef: "سوره آل‌عمران، آیه ۱۶۹",
    title: "یادبود شهدا",
    subtitle: "یاد و خاطره شهدای دفاع مقدس",
    featured: "شهدای برجسته",
    all: "همه شهدا",
    countLabel: "شهید",
    filters: "فیلتر",
    bio: "زندگی‌نامه",
    achievements: "دستاوردها",
    rank: "درجه",
    martyrdomDate: "تاریخ شهادت",
    martyrdomLocation: "محل شهادت",
    prayer: "روحش شاد و راهش پر رهرو باد",
  },
  en: {
    verse: '"Do not consider those slain in the way of God as dead. They are alive."',
    verseRef: "Al-e-Imran 3:169",
    title: "Martyrs Memorial",
    subtitle: "In memory of fallen defenders",
    featured: "Featured Martyrs",
    all: "All Martyrs",
    countLabel: "martyrs",
    filters: "Filter",
    bio: "Biography",
    achievements: "Achievements",
    rank: "Rank",
    martyrdomDate: "Martyrdom Date",
    martyrdomLocation: "Martyrdom Location",
    prayer: "May their soul be at peace and their path continue.",
  },
} as const

export function MartyrsPageClient({locale, data}: Props) {
  const t = copy[locale]
  const [selectedUnit, setSelectedUnit] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMartyr, setSelectedMartyr] = useState<Martyr | null>(null)

  const featured = useMemo(
    () =>
      selectedUnit === "all"
        ? data.featured
        : data.featured.filter((martyr) => martyr.unit_slug === selectedUnit),
    [data.featured, selectedUnit]
  )
  const items = useMemo(
    () =>
      selectedUnit === "all"
        ? data.items
        : data.items.filter((martyr) => martyr.unit_slug === selectedUnit),
    [data.items, selectedUnit]
  )

  return (
    <AppShell>
      <div className="relative px-4 pt-4 pb-8 bg-gradient-to-b from-[var(--color-crimson)]/20 to-transparent">
        <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-4">
          <p className="text-lg text-[var(--color-gold)] font-serif leading-relaxed text-center mb-2">{t.verse}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] text-center">{t.verseRef}</p>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-1">{t.title}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center">{t.subtitle}</p>
        </div>
      </div>

      <div className="px-4 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {formatNumberByLocale(featured.length + items.length, locale)} {t.countLabel}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((prev) => !prev)}
            className={showFilters ? "bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)]" : "border-[var(--color-ink-border)]"}
          >
            {t.filters}
          </Button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data.filters.units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit.id)}
                className={selectedUnit === unit.id ? "px-3 py-1.5 rounded-full text-sm bg-[var(--color-gold)] text-[var(--color-ink)]" : "px-3 py-1.5 rounded-full text-sm bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)]"}
              >
                {unit.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {featured.length > 0 && (
        <div className="px-4 pb-6 max-w-6xl mx-auto w-full">
          <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-3">{t.featured}</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {featured.map((martyr) => (
              <button key={String(martyr.id)} onClick={() => setSelectedMartyr(martyr)} className="shrink-0 w-40 text-center">
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dim)] p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-ink)]">
                      <Image src={martyr.image || "/images/placeholder-media.svg"} alt={martyr.name} fill className="object-cover" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -end-1 w-8 h-8 rounded-full bg-[var(--color-crimson)] flex items-center justify-center border-2 border-[var(--color-ink)]">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-1">{martyr.name}</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">{martyrFeaturedCaption(martyr)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-8 max-w-6xl mx-auto w-full">
        <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-3">{t.all}</h2>
        <div className="grid grid-cols-2 gap-3">
          {items.map((martyr) => (
            <button key={String(martyr.id)} onClick={() => setSelectedMartyr(martyr)} className="text-start">
              <article className="bg-[var(--color-ink-raised)] rounded-xl overflow-hidden border border-[var(--color-ink-border)] card-hover">
                <div className="relative aspect-[3/4]">
                  <Image src={martyr.image || "/images/placeholder-media.svg"} alt={martyr.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{martyr.name}</h3>
                    <p className="text-xs text-white/70">{martyrGridSubtitle(martyr)}</p>
                    {martyr.martyrdom_date && <p className="text-xs text-[var(--color-gold)] mt-1">{formatDateByLocale(martyr.martyrdom_date, locale)}</p>}
                  </div>
                </div>
              </article>
            </button>
          ))}
        </div>
      </div>

      {selectedMartyr && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedMartyr(null)} />
          <div className="absolute inset-x-0 bottom-0 bg-[var(--color-ink)] rounded-t-3xl max-h-[90vh] overflow-y-auto sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:start-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[min(760px,88vw)] sm:max-h-[82vh] sm:rounded-2xl">
            <div className="sticky top-0 bg-[var(--color-ink)] pt-3 pb-2 flex justify-center z-10 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[var(--color-ink-muted)]" />
            </div>
            <button onClick={() => setSelectedMartyr(null)} className="absolute top-4 end-4 w-8 h-8 rounded-full bg-[var(--color-ink-raised)] flex items-center justify-center z-10">
              <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </button>
            <div className="px-4 mb-4">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dim)] p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-ink)]">
                    <Image src={selectedMartyr.image || "/images/placeholder-media.svg"} alt={selectedMartyr.name} fill className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-8 text-center">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{selectedMartyr.name}</h2>
              <p className="text-sm text-[var(--color-gold)] mb-4">{selectedMartyr.title || ""}</p>
              <div className="grid grid-cols-2 gap-3 mb-6 text-start">
                <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">{t.rank}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{selectedMartyr.rank || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">{t.martyrdomDate}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {selectedMartyr.martyrdom_date ? formatDateByLocale(selectedMartyr.martyrdom_date, locale) : ""}
                  </p>
                </div>
                <div className="col-span-2 p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">{t.martyrdomLocation}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{selectedMartyr.martyrdom_location || ""}</p>
                </div>
              </div>
              <div className="text-start mb-6">
                <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-2">{t.bio}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{selectedMartyr.biography || ""}</p>
              </div>
              <div className="text-start mb-6">
                <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-2">{t.achievements}</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedMartyr.achievements || []).map((achievement) => (
                    <span key={achievement} className="px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-sm">
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-crimson)]/10 border border-[var(--color-crimson)]/30">
                <p className="text-sm text-[var(--color-text-secondary)] italic">{t.prayer}</p>
              </div>
              <div className="mt-4">
                <Button asChild className="w-full bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-[var(--color-ink)]">
                  <Link href={`/${locale}/martyrs/${selectedMartyr.slug || selectedMartyr.id}`}>
                    {locale === "fa" ? "مشاهده صفحه جزئیات" : "Open Detail Page"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function martyrFeaturedCaption(m: Martyr): string {
  return m.rank || m.title || ""
}

function martyrGridSubtitle(m: Martyr): string {
  const rank = m.rank || m.title || ""
  const unit = m.unit_label || ""
  if (rank && unit) return `${rank} - ${unit}`
  return rank || unit
}
