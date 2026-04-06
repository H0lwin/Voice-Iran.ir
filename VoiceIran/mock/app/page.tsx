"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import { 
  Newspaper, 
  Shield, 
  Users, 
  Folder, 
  ChevronLeft, 
  Play,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react'
import { AppShell } from '@/components/organisms/AppShell'
import { Button } from '@/components/ui/button'
import { toPersianNumber } from '@/lib/persian-utils'
import { fadeInUp, staggerContainer, scaleUp } from '@/lib/animations'

// Quick access cards data
const quickAccess = [
  { 
    href: '/news', 
    label: 'اخبار', 
    icon: Newspaper, 
    color: 'from-blue-600 to-blue-800',
    count: '۲۴',
    description: 'خبر جدید'
  },
  { 
    href: '/arsenal', 
    label: 'تسلیحات', 
    icon: Shield, 
    color: 'from-emerald-600 to-emerald-800',
    count: '۱۲۰+',
    description: 'سامانه دفاعی'
  },
  { 
    href: '/martyrs', 
    label: 'شهدا', 
    icon: Users, 
    color: 'from-red-700 to-red-900',
    count: '۳۰۰+',
    description: 'شهید والامقام'
  },
  { 
    href: '/documents', 
    label: 'مستندات', 
    icon: Folder, 
    color: 'from-amber-600 to-amber-800',
    count: '۵۰+',
    description: 'سند و مستند'
  },
]

// Featured news
const featuredNews = [
  {
    id: '1',
    title: 'عملیات موفق پدافند هوایی در خلیج فارس',
    image: 'https://picsum.photos/seed/defense-1/800/600',
    category: 'نظامی',
    time: '۲ ساعت پیش',
    isLive: true,
  },
  {
    id: '2',
    title: 'رونمایی از سامانه موشکی جدید',
    image: 'https://picsum.photos/seed/missile-1/800/600',
    category: 'فناوری',
    time: '۵ ساعت پیش',
  },
  {
    id: '3',
    title: 'تمرین مشترک نیروی دریایی',
    image: 'https://picsum.photos/seed/navy-1/800/600',
    category: 'نظامی',
    time: '۱ روز پیش',
  },
]

// Live stats
const stats = [
  { label: 'عملیات موفق', value: 847, icon: Target },
  { label: 'اهداف رهگیری‌شده', value: 2341, icon: Zap },
  { label: 'رزمایش‌ها', value: 156, icon: TrendingUp },
]

// Featured weapon
const featuredWeapon = {
  name: 'موشک بالستیک فتاح',
  type: 'موشک هایپرسونیک',
  range: '۱۴۰۰',
  image: 'https://picsum.photos/seed/fattah-1/800/500',
  features: ['هایپرسونیک', 'دقت بالا', 'قابلیت مانور'],
}

export default function HomePage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [statsRef, statsInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [weaponRef, weaponInView] = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <AppShell transparentHeader>
      {/* Hero Section - Cinematic */}
      <section 
        ref={heroRef}
        className="relative -mt-14 h-[70vh] min-h-[500px] overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/iran-hero/1920/1080"
            alt="دفاع مقدس"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)]/80 to-transparent" />
        </div>

        {/* Content */}
        <motion.div 
          className="relative h-full flex flex-col justify-end px-4 pb-8"
          variants={staggerContainer}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
        >
          <motion.div variants={fadeInUp} className="mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-crimson)] text-white text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              زنده
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-2xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-3 leading-tight max-w-lg"
          >
            عملیات موفق پدافند هوایی در دفاع از حریم آسمان ایران
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-md"
          >
            نیروهای مسلح با بهره‌گیری از سامانه‌های بومی، تهدیدات هوایی را خنثی کردند
          </motion.p>

          <motion.div variants={fadeInUp} className="flex items-center gap-3">
            <Button 
              className="bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-[var(--color-ink)] font-medium"
            >
              <Play className="w-4 h-4 ml-2" />
              تماشای گزارش
            </Button>
            <Button 
              variant="outline"
              className="border-[var(--color-text-secondary)] text-[var(--color-text-primary)] hover:bg-white/10"
            >
              اطلاعات بیشتر
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Access Grid */}
      <section className="px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          {quickAccess.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={item.href}>
                  <div className={`
                    relative overflow-hidden rounded-2xl p-4 h-28
                    bg-gradient-to-br ${item.color}
                    card-hover
                  `}>
                    <div className="relative z-10">
                      <Icon className="w-6 h-6 text-white/90 mb-2" />
                      <h3 className="text-white font-bold text-lg">{item.label}</h3>
                      <p className="text-white/70 text-xs">{item.count} {item.description}</p>
                    </div>
                    <div className="absolute -left-4 -bottom-4 opacity-20">
                      <Icon className="w-24 h-24 text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Live Stats */}
      <section ref={statsRef} className="px-4 py-8">
        <motion.div 
          className="bg-gradient-card rounded-2xl p-4 border border-[var(--color-ink-border)]"
          variants={staggerContainer}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
        >
          <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-4">آمار لحظه‌ای</h2>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div 
                  key={stat.label}
                  variants={scaleUp}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-[var(--color-gold)]" />
                  </div>
                  <div className="text-xl font-bold text-[var(--color-text-primary)]">
                    <CountUp end={stat.value} inView={statsInView} />
                  </div>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Featured News Carousel */}
      <section className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">آخرین اخبار</h2>
          <Link 
            href="/news" 
            className="text-sm text-[var(--color-gold)] flex items-center gap-1 hover:underline"
          >
            مشاهده همه
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {featuredNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="shrink-0 w-[280px]"
            >
              <Link href={`/news/${news.id}`}>
                <div className="relative rounded-2xl overflow-hidden card-hover">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={news.image}
                      alt={news.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {news.isLive && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--color-crimson)] text-white text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          زنده
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-xs text-[var(--color-gold)] mb-1 block">{news.category}</span>
                      <h3 className="text-sm font-bold text-white line-clamp-2">{news.title}</h3>
                      <span className="text-xs text-white/60 mt-1 block">{news.time}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Weapon */}
      <section ref={weaponRef} className="px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">تسلیحات برتر</h2>
          <Link 
            href="/arsenal" 
            className="text-sm text-[var(--color-gold)] flex items-center gap-1 hover:underline"
          >
            آرسنال کامل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={weaponInView ? "visible" : "hidden"}
        >
          <Link href="/arsenal/fattah">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-ink-raised)] to-[var(--color-ink-muted)] border border-[var(--color-ink-border)] card-hover">
              <div className="relative aspect-[16/9]">
                <Image
                  src={featuredWeapon.image}
                  alt={featuredWeapon.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-2">
                  {featuredWeapon.features.map((feature) => (
                    <span 
                      key={feature}
                      className="px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
                  {featuredWeapon.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {featuredWeapon.type}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-gold)]">
                    برد: {featuredWeapon.range} کیلومتر
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Martyrs Tribute Mini */}
      <section className="px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">یاد شهدا</h2>
          <Link 
            href="/martyrs" 
            className="text-sm text-[var(--color-gold)] flex items-center gap-1 hover:underline"
          >
            همه شهدا
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-crimson)]/20 to-[var(--color-ink-raised)] border border-[var(--color-crimson)]/30 p-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="shrink-0 text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-gold)] mb-2">
                  <Image
                    src={`https://picsum.photos/seed/martyr-${i}/200/200`}
                    alt="شهید"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] truncate w-16">شهید ...</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4 italic">
            «و لا تحسبن الذین قتلوا فی سبیل الله امواتا بل احیاء»
          </p>
        </div>
      </section>
    </AppShell>
  )
}

// CountUp component for animated numbers
function CountUp({ end, inView }: { end: number; inView: boolean }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!inView) return
    
    const duration = 2000
    const steps = 60
    const increment = end / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [end, inView])
  
  return <>{toPersianNumber(count)}</>
}
