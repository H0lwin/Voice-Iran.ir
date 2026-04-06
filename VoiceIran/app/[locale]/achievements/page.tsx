import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'
import {AchievementsPageClient} from '@/components/pages/AchievementsPageClient'
import {getAchievements} from '@/lib/api'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'achievements'})
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/achievements`,
      languages: {fa: '/fa/achievements', en: '/en/achievements'},
    },
  }
}

export default async function AchievementsPage({params}: {params: Promise<{locale: 'fa' | 'en'}>}) {
  const {locale} = await params
  const items = await getAchievements(locale)
  return <AchievementsPageClient locale={locale} items={items} />
}
