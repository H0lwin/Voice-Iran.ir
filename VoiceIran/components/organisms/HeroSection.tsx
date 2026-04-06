'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/atoms/Badge'
import { PersianDate } from '@/components/atoms/PersianDate'
import { formatReadingTime } from '@/lib/persian-utils'

interface FeaturedNews {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  date: Date
  readingTime: number
  image: string
}

interface HeroSectionProps {
  featuredNews: FeaturedNews
}

export function HeroSection({ featuredNews }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [prefersReducedMotion])

  return (
    <section className="relative h-svh overflow-hidden">
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 scale-110"
        style={{
          transform: prefersReducedMotion ? 'none' : `translateY(${scrollY * 0.3}px)`,
        }}
      >
        <Image
          src={featuredNews.image}
          fill
          alt="پس‌زمینه صفحه اصلی"
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Multi-layer Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2E] via-[#0D1B2E]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#0D1B2E]/80 via-transparent to-transparent" />

      {/* Geometric Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content - RTL, Right-aligned */}
      <div className="absolute inset-0 flex items-end pb-24 px-8 lg:px-20">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          {/* Gold Rule Line */}
          <motion.div
            initial={prefersReducedMotion ? {} : { width: 0 }}
            animate={{ width: '80px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-[3px] bg-gradient-to-l from-[var(--color-gold)] to-transparent mb-6"
          />

          {/* Category Label */}
          <span className="text-[var(--color-gold)] text-sm font-medium tracking-widest uppercase mb-4 block">
            مهم‌ترین خبر
          </span>

          {/* Category Badge */}
          <div className="mb-4">
            <Badge variant="gold">{featuredNews.category}</Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-display-xl lg:text-display-2xl font-bold text-[var(--color-text-primary)] leading-[1.2] mb-6 text-balance">
            {featuredNews.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-[var(--color-text-secondary)] leading-[1.9] mb-8 max-w-2xl text-pretty">
            {featuredNews.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-8 text-[var(--color-text-tertiary)]">
            <PersianDate date={featuredNews.date} />
            <span className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
            <span className="text-sm">{formatReadingTime(featuredNews.readingTime)}</span>
          </div>

          {/* CTA Button */}
          <Link
            href={`/news/${featuredNews.slug}`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-gold)] text-[var(--color-ink)] font-bold rounded-lg hover:bg-[var(--color-gold-light)] transition-colors group"
          >
            مطالعه کامل
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6 text-[var(--color-gold)]/60" />
      </motion.div>
    </section>
  )
}
