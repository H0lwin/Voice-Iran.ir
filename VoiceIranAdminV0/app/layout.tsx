import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const vazir = localFont({
  src: [
    { path: '../public/fonts/Vazir.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Vazir-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/Vazir-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-vazir',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'پنل مدیریت صدای ایران',
  description: 'سامانه مدیریت محتوای صدای ایران - وزارت دفاع و پشتیبانی نیروهای مسلح',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e3a5f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}