"use client"

import Link from 'next/link'
import {useLocale, useTranslations} from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')
  const nav = useTranslations('nav')
  const locale = useLocale()

  return (
    <footer className="border-t border-[var(--color-ink-border)] bg-[#0A1520]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-[var(--color-text-secondary)] mb-6">{t('description')}</p>
        <div className="flex flex-wrap gap-4 mb-6 text-sm text-[var(--color-text-tertiary)]">
          <Link href={`/${locale}`}>{nav('home')}</Link>
          <Link href={`/${locale}/news`}>{nav('news')}</Link>
          <Link href={`/${locale}/documents`}>{nav('documents')}</Link>
          <Link href={`/${locale}/search`}>{nav('search')}</Link>
        </div>
        <a
          href="https://web.splus.ir/#42828119"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-gold)] hover:underline"
        >
          {t('madeBy')}
        </a>
      </div>
    </footer>
  )
}
