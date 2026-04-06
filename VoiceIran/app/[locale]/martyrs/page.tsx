import type {Metadata} from 'next'
import {MartyrsPageClient} from '@/components/pages/MartyrsPageClient'
import {getMartyrsOverview, type MartyrsOverviewPayload} from '@/lib/api'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'martyrs'})
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/martyrs`,
      languages: {fa: '/fa/martyrs', en: '/en/martyrs'},
    },
  }
}

export default async function MartyrsPage({params}: {params: Promise<{locale: 'fa' | 'en'}>}) {
  const {locale} = await params
  const data = (await getMartyrsOverview(locale)) || buildFallback(locale)
  return <MartyrsPageClient locale={locale} data={data} />
}

function buildFallback(locale: 'fa' | 'en'): MartyrsOverviewPayload {
  return {
    filters: {units: [{id: 'all', label: locale === 'fa' ? 'همه' : 'All', count: 0}]},
    featured: [],
    items: [],
  }
}
