'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowLeft, Plane, Rocket, Ship, Radio } from 'lucide-react'
import { Badge, VerificationBadge } from '@/components/atoms/Badge'
import { GoldBar } from '@/components/atoms/GoldDivider'
import { PersianDate } from '@/components/atoms/PersianDate'
import { cn } from '@/lib/utils'

export interface Achievement {
  id: string
  title: string
  description: string
  targetType: 'drone' | 'missile' | 'aircraft' | 'ship'
  region: string
  date: Date
  verificationStatus: 'official' | 'documented' | 'claimed'
}

const targetIcons = {
  drone: Radio,
  missile: Rocket,
  aircraft: Plane,
  ship: Ship,
}

const targetLabels = {
  drone: 'پهپاد',
  missile: 'موشک',
  aircraft: 'هواپیما',
  ship: 'کشتی',
}

interface AchievementCardProps {
  achievement: Achievement
  index: number
  inView: boolean
}

function AchievementCard({ achievement, index, inView }: AchievementCardProps) {
  const Icon = targetIcons[achievement.targetType]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="flex-shrink-0 w-[300px] lg:w-[350px] group"
    >
      <Link href={`/achievements/${achievement.id}`}>
        <div className={cn(
          'p-6 rounded-xl bg-gradient-to-br from-[var(--color-ink-raised)] to-[var(--color-ink-muted)]',
          'border border-[var(--color-ink-border)] hover:border-[var(--color-gold-dim)]',
          'transition-all duration-300',
          'group-hover:scale-[1.02]'
        )}>
          {/* Top Row: Icon & Type */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-ink-muted)] flex items-center justify-center text-[var(--color-gold)]">
              <Icon className="w-6 h-6" />
            </div>
            <Badge variant="muted">{targetLabels[achievement.targetType]}</Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--color-gold)] transition-colors">
            {achievement.title}
          </h3>

          {/* Description - shows on hover */}
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
            {achievement.description}
          </p>

          {/* Meta Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PersianDate date={achievement.date} format="short" className="text-xs" />
              <span className="text-[var(--color-text-tertiary)]">|</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">{achievement.region}</span>
            </div>
            <VerificationBadge status={achievement.verificationStatus} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

interface AchievementsStripProps {
  achievements: Achievement[]
}

export function AchievementsStrip({ achievements }: AchievementsStripProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <section
      ref={ref}
      className="py-20 bg-[#0A1520] relative overflow-hidden"
    >
      {/* Topographic Map Texture */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M10,90 Q30,70 50,75 T90,50' fill='none' stroke='%23C9A84C' stroke-width='0.5'/%3E%3Cpath d='M5,80 Q25,60 55,65 T95,40' fill='none' stroke='%23C9A84C' stroke-width='0.3'/%3E%3Cpath d='M0,70 Q35,50 60,55 T100,30' fill='none' stroke='%23C9A84C' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <GoldBar />
            <h2 className="text-display-md font-bold text-[var(--color-text-primary)]">دستاوردهای اخیر</h2>
          </div>
          <Link
            href="/achievements"
            className="text-[var(--color-gold)] text-sm flex items-center gap-2 hover:gap-3 transition-all group"
          >
            مشاهده همه
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Strip */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-4 px-4 lg:px-8 scrollbar-hide snap-x snap-mandatory">
          <div className="flex gap-6 max-w-7xl mx-auto">
            {achievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
                inView={inView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
