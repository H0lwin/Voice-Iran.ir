'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { PersianDate } from '@/components/atoms/PersianDate'
import { cn } from '@/lib/utils'

export interface Martyr {
  id: string
  name: string
  martyrdomDate: Date
  unit: string
  image: string
}

interface MartyrCardProps {
  martyr: Martyr
  index: number
  inView: boolean
}

function MartyrCard({ martyr, index, inView }: MartyrCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
    >
      <Link href={`/martyrs/${martyr.id}`} className="group block text-center">
        {/* Circular Image with Gold Ring */}
        <div className="relative mx-auto w-28 h-28 lg:w-32 lg:h-32 mb-4">
          {/* Gold ring frame */}
          <div className="absolute inset-0 rounded-full border-2 border-[var(--color-gold)] group-hover:border-[var(--color-gold-light)] transition-colors" />
          <div className="absolute inset-1 rounded-full overflow-hidden">
            <Image
              src={martyr.image}
              fill
              alt={martyr.name}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="128px"
            />
          </div>
          {/* Golden glow on hover */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(201,168,76,0.3)]" />
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-gold)] transition-colors mb-2">
          {martyr.name}
        </h3>

        {/* Martyrdom Date */}
        <PersianDate date={martyr.martyrdomDate} format="full" className="text-[var(--color-text-secondary)] mb-2 block" />

        {/* Unit Badge */}
        <span className="inline-block px-3 py-1 text-xs rounded bg-[var(--color-gold-dim)] text-[var(--color-gold-light)]">
          {martyr.unit}
        </span>
      </Link>
    </motion.div>
  )
}

interface MartyrsTributeProps {
  martyrs: Martyr[]
}

export function MartyrsTribute({ martyrs }: MartyrsTributeProps) {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  })

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: '#0A1520' }}
    >
      {/* Subtle warm radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.05)_0%,_transparent_70%)]" />

      {/* Persian calligraphy pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='serif' font-size='80' fill='%23C9A84C'%3E%D8%B4%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 lg:px-8 relative">
        {/* Quranic Verse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-2xl lg:text-3xl text-[var(--color-gold)] font-bold mb-4 leading-relaxed" dir="rtl">
            {'"'}و لا تحسبن الذین قتلوا فی سبیل الله امواتاً{'"'}
          </p>
          <p className="text-[var(--color-text-secondary)]">
            آل عمران - ۱۶۹
          </p>
        </motion.div>

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-display-md font-bold text-[var(--color-text-primary)] mb-4">
            یاد شهدا
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
            در پاسداشت خاطره شهیدان راه وطن که با خون خود مرزهای این سرزمین را پاسداری کردند
          </p>
        </motion.div>

        {/* Martyrs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {martyrs.slice(0, 4).map((martyr, index) => (
            <MartyrCard key={martyr.id} martyr={martyr} index={index} inView={inView} />
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <Link
            href="/martyrs"
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-[var(--color-gold)] text-[var(--color-gold)] font-bold rounded-lg hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)] transition-colors"
          >
            مشاهده تمام شهدا
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
