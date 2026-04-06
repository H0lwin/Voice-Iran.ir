import Link from 'next/link'
import {getLocale} from 'next-intl/server'

type AppLocale = 'fa' | 'en'

function getCopy(locale: AppLocale) {
  if (locale === 'en') {
    return {
      codeLabel: 'Error 404',
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist or has been moved.',
      homeHref: '/en',
      homeLabel: 'Back To Homepage',
      dir: 'ltr' as const,
      lang: 'en',
    }
  }

  return {
    codeLabel: 'خطای 404',
    title: 'صفحه پیدا نشد',
    description: 'صفحه موردنظر شما وجود ندارد یا به نشانی دیگری منتقل شده است.',
    homeHref: '/fa',
    homeLabel: 'بازگشت به صفحه اصلی',
    dir: 'rtl' as const,
    lang: 'fa',
  }
}

export default async function LocalizedNotFound() {
  const current = (await getLocale()) as AppLocale
  const locale: AppLocale = current === 'en' ? 'en' : 'fa'
  const copy = getCopy(locale)

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#1e3150_0%,_#0d1b2e_55%,_#08101b_100%)] px-6 py-16 text-[var(--color-text-primary)]">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />
      <section
        dir={copy.dir}
        lang={copy.lang}
        className="relative mx-auto w-full max-w-2xl rounded-3xl border border-[var(--color-gold)]/30 bg-ink-raised/85 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm md:p-12"
      >
        <p className="mb-3 text-sm tracking-wide text-gold">{copy.codeLabel}</p>
        <h1 className="mb-4 text-3xl font-bold md:text-5xl">{copy.title}</h1>
        <p className="mb-10 text-base text-secondary-muted md:text-lg">{copy.description}</p>
        <Link
          href={copy.homeHref}
          className="inline-flex items-center rounded-xl bg-[var(--color-gold)] px-6 py-3 font-medium text-[var(--color-ink)] transition hover:scale-[1.02] hover:bg-[var(--color-gold-light)]"
        >
          {copy.homeLabel}
        </Link>
        <span className="pointer-events-none absolute bottom-6 text-7xl font-bold text-[var(--color-gold)]/15 md:text-8xl">
          404
        </span>
      </section>
    </main>
  )
}
