import {redirect} from 'next/navigation'
import {cookies, headers} from 'next/headers'

export default async function RootPage() {
  const cookieStore = await cookies()
  const savedLocale = cookieStore.get('voiceiran_locale')?.value
  if (savedLocale === 'fa' || savedLocale === 'en') {
    redirect(`/${savedLocale}`)
  }

  const acceptLanguage = (await headers()).get('accept-language') || ''
  const fallbackLocale = acceptLanguage.toLowerCase().includes('fa') ? 'fa' : 'en'
  redirect(`/${fallbackLocale}`)
}
