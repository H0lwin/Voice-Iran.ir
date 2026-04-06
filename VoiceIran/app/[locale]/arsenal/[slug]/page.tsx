import type {Metadata} from 'next'
import Image from 'next/image'
import {notFound} from 'next/navigation'
import {AppShell} from '@/components/organisms/AppShell'
import {getWeaponDetail} from '@/lib/api'
import {formatDateByLocale, formatNumberByLocale} from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}): Promise<Metadata> {
  const {locale, slug} = await params
  const weapon = await getWeaponDetail(locale, slug)
  if (!weapon) return {}
  return {
    title: weapon.name,
    description: weapon.description || weapon.type || '',
  }
}

export default async function ArsenalDetailPage({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}) {
  const {locale, slug} = await params
  const weapon = await getWeaponDetail(locale, slug)
  if (!weapon) notFound()

  return (
    <AppShell showBack headerTitle={locale === 'fa' ? 'جزئیات تسلیحات' : 'Weapon Detail'} hideNav>
      <section className="px-4 pt-4 pb-10 max-w-4xl mx-auto w-full">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
          <Image src={weapon.image || '/images/placeholder-media.svg'} alt={weapon.name} fill className="object-cover" />
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {weapon.category ? <span className="px-2 py-1 rounded-full text-xs bg-[var(--color-gold)]/15 text-[var(--color-gold)]">{weapon.category}</span> : null}
          {weapon.status_label ? <span className="px-2 py-1 rounded-full text-xs bg-[var(--color-emerald)]/20 text-[var(--color-emerald-light)]">{weapon.status_label}</span> : null}
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{weapon.name}</h1>
        <p className="text-[var(--color-text-secondary)] mb-4">{weapon.type || ''}</p>
        <div className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-3 mb-6">
          {weapon.published_at ? <span>{formatDateByLocale(weapon.published_at, locale)}</span> : null}
          {typeof weapon.range === 'number' ? (
            <span>
              {formatNumberByLocale(weapon.range, locale)} {locale === 'fa' ? 'کیلومتر' : 'km'}
            </span>
          ) : null}
        </div>
        {weapon.description ? <p className="text-[var(--color-text-secondary)] mb-6">{weapon.description}</p> : null}

        {(weapon.specs || []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(weapon.specs || []).map((spec) => (
              <div key={`${spec.key}-${spec.value}`} className="p-4 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{spec.key}</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </AppShell>
  )
}
