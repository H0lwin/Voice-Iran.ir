import type {Metadata} from 'next'
import {DocumentsPageClient} from '@/components/pages/DocumentsPageClient'
import {getDocumentsOverview, type DocumentsOverviewPayload} from '@/lib/api'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'documents'})
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/documents`,
      languages: {fa: '/fa/documents', en: '/en/documents'},
    },
  }
}

export default async function DocumentsPage({params}: {params: Promise<{locale: 'fa' | 'en'}>}) {
  const {locale} = await params
  const data = (await getDocumentsOverview(locale)) || buildFallback(locale)
  return <DocumentsPageClient locale={locale} data={data} />
}

function buildFallback(locale: 'fa' | 'en'): DocumentsOverviewPayload {
  return {
    filters: {types: [{id: 'all', label: locale === 'fa' ? 'همه' : 'All', count: 0}]},
    featured: [],
    items: [],
    timeline: [],
  }
}
