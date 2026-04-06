import type {Metadata} from 'next'
import Image from 'next/image'
import {notFound} from 'next/navigation'
import {AppShell} from '@/components/organisms/AppShell'
import {getMartyrDetail} from '@/lib/api'
import {formatDateByLocale} from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}): Promise<Metadata> {
  const {locale, slug} = await params
  const martyr = await getMartyrDetail(locale, slug)
  if (!martyr) return {}
  return {
    title: martyr.name,
    description: martyr.short_bio || martyr.biography || '',
  }
}

export default async function MartyrDetailPage({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}) {
  const {locale, slug} = await params
  const martyr = await getMartyrDetail(locale, slug)
  if (!martyr) notFound()

  return (
    <AppShell showBack headerTitle={locale === 'fa' ? 'جزئیات شهید' : 'Martyr Detail'} hideNav>
      <section className="px-4 pt-4 pb-10 max-w-4xl mx-auto w-full">
        <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-2 border-[var(--color-gold)] mb-4 relative">
          <Image src={martyr.image || '/images/placeholder-media.svg'} alt={martyr.name} fill className="object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-1">{martyr.name}</h1>
        <p className="text-sm text-[var(--color-gold)] text-center mb-4">{martyr.title || ''}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {martyr.unit_label ? (
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{locale === 'fa' ? 'یگان' : 'Unit'}</p>
              <p className="text-sm text-[var(--color-text-primary)]">{martyr.unit_label}</p>
            </div>
          ) : null}
          {martyr.birth_date ? (
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{locale === 'fa' ? 'تاریخ تولد' : 'Birth Date'}</p>
              <p className="text-sm text-[var(--color-text-primary)]">{formatDateByLocale(martyr.birth_date, locale)}</p>
            </div>
          ) : null}
          {martyr.martyrdom_date ? (
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{locale === 'fa' ? 'تاریخ شهادت' : 'Martyrdom Date'}</p>
              <p className="text-sm text-[var(--color-text-primary)]">{formatDateByLocale(martyr.martyrdom_date, locale)}</p>
            </div>
          ) : null}
          {martyr.martyrdom_location ? (
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{locale === 'fa' ? 'محل شهادت' : 'Martyrdom Location'}</p>
              <p className="text-sm text-[var(--color-text-primary)]">{martyr.martyrdom_location}</p>
            </div>
          ) : null}
        </div>

        {martyr.biography ? (
          <>
            <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-2">{locale === 'fa' ? 'زندگی‌نامه' : 'Biography'}</h2>
            <p className="text-[var(--color-text-secondary)] mb-6 leading-7">{martyr.biography}</p>
          </>
        ) : null}

        {(martyr.achievements || []).length > 0 ? (
          <>
            <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-2">{locale === 'fa' ? 'دستاوردها' : 'Achievements'}</h2>
            <div className="flex flex-wrap gap-2">
              {(martyr.achievements || []).map((item) => (
                <span key={item} className="px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-sm">
                  {item}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </AppShell>
  )
}
