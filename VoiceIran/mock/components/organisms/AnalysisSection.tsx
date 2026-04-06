'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowLeft, Clock } from 'lucide-react'
import { Badge } from '@/components/atoms/Badge'
import { GoldBar } from '@/components/atoms/GoldDivider'
import { PersianDate } from '@/components/atoms/PersianDate'
import { formatReadingTime } from '@/lib/persian-utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export interface AnalysisArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  date: Date
  readingTime: number
  author: {
    name: string
    role: string
    image: string
  }
}

interface AnalysisCardProps {
  article: AnalysisArticle
}

function AnalysisCard({ article }: AnalysisCardProps) {
  return (
    <Link href={`/analysis/${article.slug}`} className="group block h-full">
      <motion.article
        variants={staggerItem}
        className="h-full bg-[var(--color-ink-raised)] rounded-xl overflow-hidden flex flex-col"
      >
        {/* Gold line at top */}
        <div className="h-0.5 bg-[var(--color-gold)]" />

        <div className="p-6 flex-1 flex flex-col">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={article.author.image}
                fill
                alt={article.author.name}
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {article.author.name}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {article.author.role}
              </p>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-3 line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2 flex-1">
            {article.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-ink-border)]">
            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{formatReadingTime(article.readingTime)}</span>
            </div>
            <Badge variant="muted">{article.category}</Badge>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

interface AnalysisSectionProps {
  articles: AnalysisArticle[]
}

export function AnalysisSection({ articles }: AnalysisSectionProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <section ref={ref} className="py-20 px-4 lg:px-8 bg-[var(--color-ink)]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <GoldBar />
            <h2 className="text-display-md font-bold text-[var(--color-text-primary)]">تحلیل‌های برگزیده</h2>
          </div>
          <Link
            href="/analysis"
            className="text-[var(--color-gold)] text-sm flex items-center gap-2 hover:gap-3 transition-all group"
          >
            مشاهده همه
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {articles.slice(0, 3).map((article) => (
            <AnalysisCard key={article.id} article={article} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
