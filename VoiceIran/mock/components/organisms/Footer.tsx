'use client'

import Link from 'next/link'
import { QUICK_LINKS, SITE_SECTIONS, SITE_INFO } from '@/lib/constants'
import { GoldDivider } from '@/components/atoms/GoldDivider'

export function Footer() {
  return (
    <footer className="bg-[#0A1520] border-t border-[var(--color-ink-border)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Logo, Description, Social */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dim)] flex items-center justify-center">
                <svg className="w-7 h-7 text-[var(--color-ink)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {SITE_INFO.name}
              </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
              {SITE_INFO.description}. این سامانه با هدف اطلاع‌رسانی شفاف و دقیق به شهروندان ایرانی درباره دستاوردهای دفاعی کشور راه‌اندازی شده است.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-[var(--color-ink-raised)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-ink-muted)] transition-colors"
                aria-label="تلگرام"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-[var(--color-ink-raised)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-ink-muted)] transition-colors"
                aria-label="اینستاگرام"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-[var(--color-ink-raised)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-ink-muted)] transition-colors"
                aria-label="ایکس"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-[var(--color-gold)] mb-6">
              دسترسی سریع
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-3 h-3 text-[var(--color-gold-dim)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Site Sections */}
          <div>
            <h3 className="text-lg font-bold text-[var(--color-gold)] mb-6">
              بخش‌های سایت
            </h3>
            <ul className="space-y-3">
              {SITE_SECTIONS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-3 h-3 text-[var(--color-gold-dim)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-[var(--color-gold)] mb-6">
              اطلاعات تماس
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-ink-raised)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-[var(--color-text-secondary)]">
                  تهران، خیابان آزادی
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-ink-raised)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[var(--color-text-secondary)]" dir="ltr">
                  info@defense.ir
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-ink-raised)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-[var(--color-text-secondary)]" dir="ltr">
                  +98 21 1234 5678
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--color-gold-dim)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {SITE_INFO.copyright} | نسخه {SITE_INFO.version}
            </p>
            <div className="flex items-center gap-6 text-sm text-[var(--color-text-tertiary)]">
              <Link href="/privacy" className="hover:text-[var(--color-gold)] transition-colors">
                حریم خصوصی
              </Link>
              <Link href="/terms" className="hover:text-[var(--color-gold)] transition-colors">
                شرایط استفاده
              </Link>
              <Link href="/contact" className="hover:text-[var(--color-gold)] transition-colors">
                تماس با ما
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
