import type {Metadata} from 'next'
import localFont from 'next/font/local'
import {getLocale, getTranslations} from 'next-intl/server'
import {getDirection} from '@/lib/i18n'
import './globals.css'

const geist = localFont({
  src: [
    {path: '../public/fonts/Geist-Regular.ttf', weight: '400', style: 'normal'},
    {path: '../public/fonts/Geist-Medium.ttf', weight: '500', style: 'normal'},
    {path: '../public/fonts/Geist-SemiBold.ttf', weight: '600', style: 'normal'},
    {path: '../public/fonts/Geist-Bold.ttf', weight: '700', style: 'normal'},
  ],
  variable: '--font-geist',
  display: 'swap',
})

const vazir = localFont({
  src: [
    {path: '../public/fonts/Vazir.woff2', weight: '400', style: 'normal'},
    {path: '../public/fonts/Vazir-Medium.woff2', weight: '500', style: 'normal'},
    {path: '../public/fonts/Vazir-Bold.woff2', weight: '700', style: 'normal'},
  ],
  variable: '--font-vazir',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as 'fa' | 'en'
  const t = await getTranslations({locale, namespace: 'meta'})
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    metadataBase: new URL(baseUrl),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fa: '/fa',
        en: '/en',
        'x-default': '/fa',
      },
    },
  }
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const locale = (await getLocale()) as 'fa' | 'en'
  const dir = getDirection(locale)

  return (
    <html lang={locale} dir={dir} data-theme="dark" className={`${geist.variable} ${vazir.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
