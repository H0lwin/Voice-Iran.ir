'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowLeft } from 'lucide-react'
import { NewsCard, type NewsItem } from '@/components/molecules/NewsCard'
import { GoldBar } from '@/components/atoms/GoldDivider'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface NewsGridProps {
  news: NewsItem[]
  title?: string
  showViewAll?: boolean
}

export function NewsGrid({ news, title = 'آخرین اخبار', showViewAll = true }: NewsGridProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  // Ensure we have at least 6 items for the grid layout
  const [featured, ...rest] = news
  const gridNews = rest.slice(0, 5)

  return (
    <section ref={ref} className="py-20 px-4 lg:px-8 bg-[var(--color-ink)]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <GoldBar />
            <h2 className="text-display-md font-bold text-[var(--color-text-primary)]">{title}</h2>
          </div>
          {showViewAll && (
            <Link
              href="/news"
              className="text-[var(--color-gold)] text-sm flex items-center gap-2 hover:gap-3 transition-all group"
            >
              مشاهده همه
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          )}
        </div>

        {/* Asymmetric Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Featured Card - Spans 2 rows */}
          {featured && (
            <motion.div variants={staggerItem} className="lg:row-span-2 min-h-[400px] lg:min-h-[500px]">
              <NewsCard news={featured} variant="large" className="h-full" />
            </motion.div>
          )}

          {/* Cards 2 & 3 */}
          {gridNews.slice(0, 2).map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
              <NewsCard news={item} variant="small" />
            </motion.div>
          ))}

          {/* Card 4 - Wide */}
          {gridNews[2] && (
            <motion.div variants={staggerItem} className="lg:col-span-2">
              <NewsCard news={gridNews[2]} variant="wide" />
            </motion.div>
          )}

          {/* Cards 5 & 6 */}
          {gridNews.slice(3, 5).map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
              <NewsCard news={item} variant="small" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
