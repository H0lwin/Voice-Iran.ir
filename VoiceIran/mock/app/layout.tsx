import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-vazirmatn',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'سامانه اطلاع‌رسانی دفاعی | جمهوری اسلامی ایران',
  description: 'سامانه رسمی اطلاع‌رسانی دفاعی جمهوری اسلامی ایران - اخبار، دستاوردها، شهدا، تحلیل‌ها و مستندات',
  generator: 'v0.app',
  keywords: ['دفاع', 'نظامی', 'ایران', 'شهدا', 'دستاوردها', 'اخبار دفاعی'],
  authors: [{ name: 'جمهوری اسلامی ایران' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0D1B2E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark" className={vazirmatn.variable}>
      <body className="font-sans antialiased">
        {/* Skip to main content for accessibility */}
        <a 
          href="#main" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-gold)] focus:text-[var(--color-ink)] focus:rounded"
        >
          رفتن به محتوای اصلی
        </a>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
