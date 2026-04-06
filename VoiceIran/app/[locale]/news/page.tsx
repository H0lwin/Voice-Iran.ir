import type {Metadata} from 'next'
import {NewsPageClient} from '@/components/pages/NewsPageClient'
import {getNewsOverview, type NewsOverviewPayload} from '@/lib/api'
import {getTranslations} from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'news'})
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/news`,
      languages: {fa: '/fa/news', en: '/en/news'},
    },
  }
}

export default async function NewsPage({params}: {params: Promise<{locale: 'fa' | 'en'}>}) {
  const {locale} = await params
  const data = (await getNewsOverview(locale)) || buildFallback(locale)
  return <NewsPageClient locale={locale} data={data} />
}

function buildFallback(locale: 'fa' | 'en'): NewsOverviewPayload {
  return {
    filters: {categories: [{id: 'all', label: locale === 'fa' ? 'همه' : 'All', count: 0}]},
    trending_terms: [],
    featured: null,
    items: [],
  }
}
