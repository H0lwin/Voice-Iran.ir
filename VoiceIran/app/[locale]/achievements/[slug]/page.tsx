import type {Metadata} from 'next'
import Image from 'next/image'
import {notFound} from 'next/navigation'
import {AppShell} from '@/components/organisms/AppShell'
import {getAchievementDetail} from '@/lib/api'
import {formatDateByLocale, formatNumberByLocale} from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}): Promise<Metadata> {
  const {locale, slug} = await params
  const item = await getAchievementDetail(locale, slug)
  if (!item) return {}
  return {
    title: item.title,
    description: item.excerpt || item.summary || '',
  }
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}) {
  const {locale, slug} = await params
  const item = await getAchievementDetail(locale, slug)
  if (!item) notFound()

  return (
    <AppShell showBack headerTitle={locale === 'fa' ? 'جزئیات دستاورد' : 'Achievement Detail'} hideNav>
      <article className="px-4 pt-4 pb-10 max-w-4xl mx-auto w-full">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
          <Image src={item.image || '/images/placeholder-media.svg'} alt={item.title} fill className="object-cover" />
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {item.target_type_label ? <span className="px-2 py-1 rounded-full text-xs bg-[var(--color-gold)]/15 text-[var(--color-gold)]">{item.target_type_label}</span> : null}
          {item.verification_status_label ? <span className="px-2 py-1 rounded-full text-xs bg-[var(--color-ink-muted)] text-[var(--color-text-secondary)]">{item.verification_status_label}</span> : null}
          {item.region ? <span className="text-xs text-[var(--color-text-tertiary)]">{item.region}</span> : null}
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{item.title}</h1>
        <div className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-3 mb-4">
          {item.published_at ? <span>{formatDateByLocale(item.published_at, locale)}</span> : null}
          <span>
            {locale === 'fa' ? 'اهداف نابود شده:' : 'Destroyed Targets:'} {formatNumberByLocale(item.destroyed_targets_count || 0, locale)}
          </span>
          <span>
            {locale === 'fa' ? 'شاخص دستاورد:' : 'Strategic Gain:'} {formatNumberByLocale(item.strategic_gain_count || 0, locale)}
          </span>
        </div>
        {item.summary ? <p className="text-[var(--color-text-secondary)] mb-4">{item.summary}</p> : null}
        {item.content ? (
          <div className="prose prose-invert max-w-none prose-p:text-[var(--color-text-secondary)]" dangerouslySetInnerHTML={{__html: item.content}} />
        ) : (
          <p className="text-[var(--color-text-secondary)]">{item.excerpt || ''}</p>
        )}
      </article>
    </AppShell>
  )
}
