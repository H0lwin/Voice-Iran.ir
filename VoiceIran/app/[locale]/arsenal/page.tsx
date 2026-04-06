import type {Metadata} from 'next'
import {ArsenalPageClient} from '@/components/pages/ArsenalPageClient'
import {getArsenalOverview, type ArsenalOverviewPayload} from '@/lib/api'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'arsenal'})
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/arsenal`,
      languages: {fa: '/fa/arsenal', en: '/en/arsenal'},
    },
  }
}

export default async function ArsenalPage({params}: {params: Promise<{locale: 'fa' | 'en'}>}) {
  const {locale} = await params
  const data = (await getArsenalOverview(locale)) || buildFallback(locale)
  return <ArsenalPageClient locale={locale} data={data} />
}

function buildFallback(locale: 'fa' | 'en'): ArsenalOverviewPayload {
  return {
    filters: {categories: [{id: 'all', label: locale === 'fa' ? 'همه' : 'All', count: 0}]},
    stats: {total: 0, operational: 0, max_range: 0},
    items: [],
  }
}
