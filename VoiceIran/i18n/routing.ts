import {defineRouting} from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always',
  localeCookie: {
    name: 'voiceiran_locale',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  },
})

export type AppLocale = (typeof routing.locales)[number]
