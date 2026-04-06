'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/atoms/Badge'
import { PersianDate } from '@/components/atoms/PersianDate'
import { formatReadingTime } from '@/lib/persian-utils'
import { cn } from '@/lib/utils'

export interface NewsItem {
  id: string
  slug: string
  title: string
  excerpt?: string
  category: string
  date: Date
  readingTime: number
  image: string
  featured?: boolean
}

interface NewsCardProps {
  news: NewsItem
  variant?: 'large' | 'small' | 'wide'
  className?: string
}

export function NewsCard({ news, variant = 'small', className }: NewsCardProps) {
  if (variant === 'large') {
    return (
      <Link href={`/news/${news.slug}`} className={cn('group block relative', className)}>
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-full rounded-xl overflow-hidden"
        >
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={news.image}
              fill
              alt={news.title}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2E] via-[#0D1B2E]/50 to-transparent" />

          {/* Gold border on hover */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-gold)] rounded-xl transition-colors duration-300" />

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="gold">{news.category}</Badge>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 right-0 left-0 p-6">
            <h3 className="text-display-md font-bold text-[var(--color-text-primary)] mb-3 line-clamp-3 group-hover:text-[var(--color-gold)] transition-colors">
              {news.title}
            </h3>
            {news.excerpt && (
              <p className="text-[var(--color-text-secondary)] line-clamp-2 mb-4">
                {news.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-[var(--color-text-tertiary)]">
              <PersianDate date={news.date} />
              <span className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
              <span className="text-sm">{formatReadingTime(news.readingTime)}</span>
            </div>
          </div>
        </motion.article>
      </Link>
    )
  }

  if (variant === 'wide') {
    return (
      <Link href={`/news/${news.slug}`} className={cn('group block', className)}>
        <motion.article
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex gap-4 bg-[var(--color-ink-raised)] rounded-xl overflow-hidden h-full"
        >
          {/* Image */}
          <div className="relative w-1/3 min-h-[140px]">
            <Image
              src={news.image}
              fill
              alt={news.title}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-center">
            <Badge variant="muted" className="self-start mb-2">{news.category}</Badge>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
              {news.title}
            </h3>
            <div className="flex items-center gap-3 text-[var(--color-text-tertiary)]">
              <PersianDate date={news.date} format="short" />
              <span className="text-xs">{formatReadingTime(news.readingTime)}</span>
            </div>
          </div>
        </motion.article>
      </Link>
    )
  }

  // Small variant (default)
  return (
    <Link href={`/news/${news.slug}`} className={cn('group block', className)}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="bg-[var(--color-ink-raised)] rounded-xl overflow-hidden h-full"
      >
        {/* Image */}
        <div className="relative aspect-video">
          <Image
            src={news.image}
            fill
            alt={news.title}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="gold">{news.category}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-3 line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
            {news.title}
          </h3>
          <div className="flex items-center gap-3 text-[var(--color-text-tertiary)]">
            <PersianDate date={news.date} format="short" />
            <span className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
            <span className="text-xs">{formatReadingTime(news.readingTime)}</span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
