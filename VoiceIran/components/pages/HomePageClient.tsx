"use client"

import {useEffect, useMemo, useState} from "react"
import {motion} from "framer-motion"
import Image from "next/image"
import {useInView} from "react-intersection-observer"
import {ChevronLeft, ChevronRight, Folder, Newspaper, Play, Shield, Target, TrendingUp, Users, Zap} from "lucide-react"
import {AppShell} from "@/components/organisms/AppShell"
import {Button} from "@/components/ui/button"
import {Link} from "@/i18n/navigation"
import type {AppLocale} from "@/i18n/routing"
import type {HomePagePayload} from "@/lib/api"
import {fadeInUp, scaleUp, staggerContainer} from "@/lib/animations"
import {formatDateByLocale, formatNumberByLocale, isRtlLocale} from "@/lib/i18n"

type Props = {
  locale: AppLocale
  data: HomePagePayload
}

const quickAccessVisual = {
  news: {icon: Newspaper, color: "from-blue-600 to-blue-800"},
  arsenal: {icon: Shield, color: "from-emerald-600 to-emerald-800"},
  martyrs: {icon: Users, color: "from-red-700 to-red-900"},
  documents: {icon: Folder, color: "from-amber-600 to-amber-800"},
} as const

const statsIconMap = {
  operations: Target,
  intercepted: Zap,
  drills: TrendingUp,
} as const

function relativeTimeLabel(dateValue?: string, locale: AppLocale = "fa"): string {
  if (!dateValue) return ""
  const published = new Date(dateValue)
  if (Number.isNaN(published.getTime())) return ""
  const now = Date.now()
  const diffMs = now - published.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const rtf = new Intl.RelativeTimeFormat(locale, {numeric: "auto"})

  if (diffMs < hour) return rtf.format(-Math.max(1, Math.floor(diffMs / minute)), "minute")
  if (diffMs < day) return rtf.format(-Math.max(1, Math.floor(diffMs / hour)), "hour")
  if (diffMs < 7 * day) return rtf.format(-Math.max(1, Math.floor(diffMs / day)), "day")
  return formatDateByLocale(published, locale)
}

export function HomePageClient({locale, data}: Props) {
  const isRtl = isRtlLocale(locale)
  const [heroRef, heroInView] = useInView({threshold: 0.1, triggerOnce: true})
  const [statsRef, statsInView] = useInView({threshold: 0.2, triggerOnce: true})
  const [weaponRef, weaponInView] = useInView({threshold: 0.2, triggerOnce: true})

  const heroBackground = data.hero.background_image || "/images/placeholder-media.svg"
  const newsItems = data.sections.latest_news.items.slice(0, 6)
  const achievementItems = data.sections.latest_achievements.items.slice(0, 6)
  const featuredWeapon = data.sections.featured_weapons.item
  const martyrItems = data.sections.featured_martyrs.items.slice(0, 8)
  const docItems = data.sections.featured_documents.items.slice(0, 3)

  const arrowIcon = useMemo(() => (isRtl ? ChevronLeft : ChevronRight), [isRtl])
  const ArrowIcon = arrowIcon

  return (
    <AppShell transparentHeader>
      <section ref={heroRef} className="relative -mt-14 h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroBackground} alt={data.hero.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/60 to-transparent" />
          <div
            className={`absolute inset-0 ${isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-[var(--color-ink)]/80 to-transparent`}
          />
        </div>

        <motion.div
          className="relative h-full flex flex-col justify-end px-4 pb-8 w-full"
          variants={staggerContainer}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
        >
          <motion.div variants={fadeInUp} className="mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-crimson)] text-white text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {data.hero.live_badge}
            </span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-2xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-3 leading-tight max-w-lg text-start">
            {data.hero.title}
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-md text-start">
            {data.hero.description}
          </motion.p>

          <motion.div variants={fadeInUp} className="flex items-center gap-3 flex-wrap">
            <Button className="bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-[var(--color-ink)] font-medium">
              <Play className="w-4 h-4 me-2" />
              {data.hero.primary_action_label}
            </Button>
            <Button
              variant="outline"
              className="border-[var(--color-text-secondary)] text-[var(--color-text-primary)] hover:bg-white/10"
            >
              {data.hero.secondary_action_label}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-4 -mt-4 relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3">
          {data.quick_access.items.slice(0, 4).map((item, index) => {
            const visual = quickAccessVisual[item.key as keyof typeof quickAccessVisual] || quickAccessVisual.news
            const Icon = visual.icon
            return (
              <motion.div
                key={`${item.key}-${item.href}`}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.1 * index}}
              >
                <Link href={item.href}>
                  <div className={`relative overflow-hidden rounded-2xl p-4 h-28 bg-gradient-to-br ${visual.color} card-hover`}>
                    <div className="relative z-10">
                      <Icon className="w-6 h-6 text-white/90 mb-2" />
                      <h3 className="text-white font-bold text-lg text-start">{item.label}</h3>
                      <p className="text-white/70 text-xs text-start">
                        {formatNumberByLocale(item.count, locale)}
                        {locale === "fa" ? " " : " "}
                        {item.description}
                      </p>
                    </div>
                    <div className={`absolute ${isRtl ? "-left-4" : "-right-4"} -bottom-4 opacity-20`}>
                      <Icon className="w-24 h-24 text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section ref={statsRef} className="px-4 py-8 max-w-6xl mx-auto w-full">
        <motion.div
          className="bg-gradient-card rounded-2xl p-4 border border-[var(--color-ink-border)]"
          variants={staggerContainer}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
        >
          <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-4 text-start">{data.live_stats.title}</h2>
          <div className="grid grid-cols-3 gap-4">
            {data.live_stats.items.slice(0, 3).map((stat) => {
              const Icon = statsIconMap[stat.key as keyof typeof statsIconMap] || Target
              return (
                <motion.div key={stat.key} variants={scaleUp} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-[var(--color-gold)]" />
                  </div>
                  <div className="text-xl font-bold text-[var(--color-text-primary)]">
                    <CountUp end={stat.value} inView={statsInView} locale={locale} />
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      <section className="px-4 pb-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] text-start">{data.sections.latest_news.title}</h2>
          <Link href="/news" className="text-sm text-[var(--color-gold)] flex items-center gap-1 hover:underline ms-auto">
            {data.sections.latest_news.view_all_label}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {newsItems.map((news, index) => (
            <motion.div
              key={String(news.id)}
              initial={{opacity: 0, x: isRtl ? 20 : -20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.1 * index}}
              className="shrink-0 w-[280px]"
            >
              <Link href={`/news/${news.slug || news.id}`}>
                <div className="relative rounded-2xl overflow-hidden card-hover">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={news.image || "/images/placeholder-media.svg"}
                      alt={news.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {news.is_live && (
                      <div className={`absolute top-3 ${isRtl ? "right-3" : "left-3"}`}>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--color-crimson)] text-white text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          {data.hero.live_badge}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-xs text-[var(--color-gold)] mb-1 block text-start">{news.category || ""}</span>
                      <h3 className="text-sm font-bold text-white line-clamp-2 text-start">{news.title}</h3>
                      <span className="text-xs text-white/60 mt-1 block text-start">
                        {relativeTimeLabel(news.published_at, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {newsItems.length === 0 && <p className="text-sm text-[var(--color-text-tertiary)] px-1">{data.common.empty_label}</p>}
        </div>
      </section>

      <section className="px-4 pb-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] text-start">{data.sections.latest_achievements.title}</h2>
          <Link href="/achievements" className="text-sm text-[var(--color-gold)] flex items-center gap-1 hover:underline ms-auto">
            {data.sections.latest_achievements.view_all_label}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {achievementItems.map((item) => (
            <Link key={String(item.id)} href={`/achievements/${item.slug || item.id}`} className="shrink-0 w-[280px]">
              <article className="bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)] rounded-xl overflow-hidden h-full card-hover">
                <div className="relative aspect-[16/9]">
                  <Image src={item.image || "/images/placeholder-media.svg"} alt={item.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {item.target_type_label ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-gold)]/15 text-[var(--color-gold)]">{item.target_type_label}</span>
                    ) : null}
                    {item.verification_status_label ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-ink-muted)] text-[var(--color-text-secondary)]">{item.verification_status_label}</span>
                    ) : null}
                  </div>
                  <h3 className="font-bold text-[var(--color-text-primary)] line-clamp-2 text-start mb-1">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 text-start">{item.excerpt || item.summary || ""}</p>
                </div>
              </article>
            </Link>
          ))}
          {achievementItems.length === 0 && <p className="text-sm text-[var(--color-text-tertiary)]">{data.common.empty_label}</p>}
        </div>
      </section>

      <section ref={weaponRef} className="px-4 pb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] text-start">{data.sections.featured_weapons.title}</h2>
          <Link href="/arsenal" className="text-sm text-[var(--color-gold)] flex items-center gap-1 hover:underline ms-auto">
            {data.sections.featured_weapons.view_all_label}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <motion.div variants={fadeInUp} initial="hidden" animate={weaponInView ? "visible" : "hidden"}>
          {featuredWeapon ? (
            <Link href={`/arsenal/${featuredWeapon.slug || featuredWeapon.id}`}>
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-ink-raised)] to-[var(--color-ink-muted)] border border-[var(--color-ink-border)] card-hover">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={featuredWeapon.image || "/images/placeholder-media.svg"}
                    alt={featuredWeapon.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {(featuredWeapon.features || []).slice(0, 3).map((feature) => (
                      <span key={feature} className="px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1 text-start">{featuredWeapon.name}</h3>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[var(--color-text-secondary)] text-start">
                      {featuredWeapon.type || featuredWeapon.category || ""}
                    </span>
                    <span className="text-sm font-medium text-[var(--color-gold)]">
                      {locale === "fa" ? "برد: " : "Range: "}
                      {typeof featuredWeapon.range === "number"
                        ? `${formatNumberByLocale(featuredWeapon.range, locale)}${locale === "fa" ? " کیلومتر" : " km"}`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-[var(--color-text-tertiary)]">{data.common.empty_label}</p>
          )}
        </motion.div>
      </section>

      <section className="px-4 pb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] text-start">{data.sections.featured_martyrs.title}</h2>
          <Link href="/martyrs" className="text-sm text-[var(--color-gold)] flex items-center gap-1 hover:underline ms-auto">
            {data.sections.featured_martyrs.view_all_label}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-crimson)]/20 to-[var(--color-ink-raised)] border border-[var(--color-crimson)]/30 p-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
            {martyrItems.map((martyr, i) => (
              <div key={String(martyr.id)} className="shrink-0 text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-gold)] mb-2">
                  <Image
                    src={martyr.image || "/images/placeholder-media.svg"}
                    alt={martyr.name}
                    width={64}
                    height={64}
                    className="object-cover w-16 h-16"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] truncate w-16">{martyr.name}</p>
              </div>
            ))}
            {martyrItems.length === 0 && <p className="text-sm text-[var(--color-text-tertiary)]">{data.common.empty_label}</p>}
          </div>

          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4 italic">{data.sections.featured_martyrs.quote}</p>
        </div>
      </section>

      <section className="px-4 pb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center mb-3">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] text-start">{data.sections.featured_documents.title}</h2>
          <Link href="/documents" className="text-sm text-[var(--color-gold)] flex items-center gap-1 hover:underline ms-auto">
            {data.sections.featured_documents.view_all_label}
            <ArrowIcon className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {docItems.map((doc) => (
            <article key={String(doc.id)} className="bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)] rounded-xl p-4">
              <h3 className="font-bold text-[var(--color-text-primary)] mb-1 text-start">{doc.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] text-start">{doc.description || ""}</p>
            </article>
          ))}
          {docItems.length === 0 ? <p className="text-sm text-[var(--color-text-tertiary)]">{data.common.empty_label}</p> : null}
        </div>
      </section>
    </AppShell>
  )
}

function CountUp({end, inView, locale}: {end: number; inView: boolean; locale: AppLocale}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    const duration = 2000
    const steps = 60
    const increment = end / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [end, inView])

  return <>{formatNumberByLocale(count, locale)}</>
}
