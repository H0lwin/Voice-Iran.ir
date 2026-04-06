import {getRequestConfig} from 'next-intl/server'
import {hasLocale} from 'next-intl'
import {routing} from './routing'

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale
  const validLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  }
})
