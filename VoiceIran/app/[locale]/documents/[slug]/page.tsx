import type {Metadata} from 'next'
import Image from 'next/image'
import {notFound} from 'next/navigation'
import {AppShell} from '@/components/organisms/AppShell'
import {getDocumentDetail} from '@/lib/api'
import {formatDateByLocale, formatNumberByLocale} from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}): Promise<Metadata> {
  const {locale, slug} = await params
  const document = await getDocumentDetail(locale, slug)
  if (!document) return {}
  return {
    title: document.title,
    description: document.description || document.summary || '',
  }
}

function durationLabel(seconds?: number) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}) {
  const {locale, slug} = await params
  const document = await getDocumentDetail(locale, slug)
  if (!document) notFound()

  return (
    <AppShell showBack headerTitle={locale === 'fa' ? 'جزئیات مستند' : 'Document Detail'} hideNav>
      <section className="px-4 pt-4 pb-10 max-w-4xl mx-auto w-full">
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
          <Image src={document.thumbnail || '/images/placeholder-media.svg'} alt={document.title} fill className="object-cover" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          {document.type_label ? (
            <span className="px-2 py-1 rounded-full text-xs bg-[var(--color-gold)]/15 text-[var(--color-gold)]">{document.type_label}</span>
          ) : null}
          {document.published_at ? <span className="text-xs text-[var(--color-text-tertiary)]">{formatDateByLocale(document.published_at, locale)}</span> : null}
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">{document.title}</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">{document.description || document.summary || ''}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{locale === 'fa' ? 'بازدید' : 'Views'}</p>
            <p className="font-bold text-[var(--color-text-primary)]">{formatNumberByLocale(document.view_count || 0, locale)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{locale === 'fa' ? 'دانلود' : 'Downloads'}</p>
            <p className="font-bold text-[var(--color-text-primary)]">{formatNumberByLocale(document.download_count || 0, locale)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{locale === 'fa' ? 'مدت' : 'Duration'}</p>
            <p className="font-bold text-[var(--color-text-primary)]">{durationLabel(document.duration_seconds) || '-'}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{locale === 'fa' ? 'تعداد' : 'Count'}</p>
            <p className="font-bold text-[var(--color-text-primary)]">
              {formatNumberByLocale(document.page_count || document.item_count || 0, locale)}
            </p>
          </div>
        </div>

        {document.primary_file_url ? (
          <a
            href={document.primary_file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-ink)] font-medium"
          >
            {locale === 'fa' ? 'باز کردن فایل' : 'Open File'}
          </a>
        ) : null}
      </section>
    </AppShell>
  )
}
