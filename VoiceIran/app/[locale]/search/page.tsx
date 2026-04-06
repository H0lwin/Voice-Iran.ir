import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'
import SearchPageClient from '@/components/pages/SearchPageClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'search'})
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/search`,
      languages: {fa: '/fa/search', en: '/en/search'},
    },
  }
}

export default function SearchPage() {
  return <SearchPageClient />
}
