import {routing, type AppLocale} from '@/i18n/routing'

export function isRtlLocale(locale: AppLocale): boolean {
  return locale === 'fa'
}

export function getDirection(locale: AppLocale): 'rtl' | 'ltr' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr'
}

export function formatNumberByLocale(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatDateByLocale(value: string | Date, locale: AppLocale): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, {dateStyle: 'medium'}).format(date)
}

export function normalizeLocale(locale: string): AppLocale {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : routing.defaultLocale
}
