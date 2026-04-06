'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Shield, Target, FileText, BarChart3 } from 'lucide-react'
import { toPersianDigits } from '@/lib/persian-utils'
import { cn } from '@/lib/utils'

interface Stat {
  value: number
  label: string
  icon: React.ReactNode
}

const stats: Stat[] = [
  { value: 147, label: 'عملیات مستند‌شده', icon: <Shield className="w-8 h-8" /> },
  { value: 328, label: 'هدف خنثی‌شده', icon: <Target className="w-8 h-8" /> },
  { value: 1240, label: 'سند در آرشیو', icon: <FileText className="w-8 h-8" /> },
  { value: 86, label: 'مقاله تحلیلی', icon: <BarChart3 className="w-8 h-8" /> },
]

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!start) return
    if (prefersReducedMotion) {
      setCount(end)
      return
    }

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, start, prefersReducedMotion])

  return count
}

function StatCard({ stat, index, inView }: { stat: Stat; index: number; inView: boolean }) {
  const count = useCountUp(stat.value, 2000, inView)
  const formattedValue = toPersianDigits(count.toLocaleString())

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
      className={cn(
        'relative flex flex-col items-center p-8',
        'bg-gradient-to-br from-[var(--color-ink-raised)] to-[var(--color-ink-muted)]',
        'border-t-2 border-[var(--color-gold)]',
        'rounded-lg',
        index < stats.length - 1 && 'lg:border-l border-[var(--color-ink-border)]'
      )}
    >
      {/* Icon */}
      <div className="text-[var(--color-gold)] mb-4">
        {stat.icon}
      </div>

      {/* Number */}
      <span className="text-display-md font-bold text-[var(--color-gold)] mb-2">
        {formattedValue}
      </span>

      {/* Label */}
      <span className="text-sm text-[var(--color-text-secondary)] text-center">
        {stat.label}
      </span>
    </motion.div>
  )
}

export function StatCounters() {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  return (
    <section ref={ref} className="py-16 px-4 lg:px-8 bg-[var(--color-ink)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
