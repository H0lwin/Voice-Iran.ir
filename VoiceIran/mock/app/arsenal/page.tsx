"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Rocket, 
  Plane, 
  Ship, 
  Target, 
  Radio, 
  Shield,
  ChevronLeft,
  Info,
  Zap,
  Crosshair
} from 'lucide-react'
import { AppShell } from '@/components/organisms/AppShell'
import { Button } from '@/components/ui/button'
import { toPersianNumber } from '@/lib/persian-utils'
import { fadeInUp, staggerContainer } from '@/lib/animations'

// Weapon categories
const categories = [
  { id: 'all', label: 'همه', icon: Shield },
  { id: 'missiles', label: 'موشک', icon: Rocket },
  { id: 'drones', label: 'پهپاد', icon: Plane },
  { id: 'naval', label: 'دریایی', icon: Ship },
  { id: 'radar', label: 'رادار', icon: Radio },
  { id: 'defense', label: 'پدافند', icon: Target },
]

// Weapons data
const weapons = [
  {
    id: 'fattah',
    name: 'فتاح',
    nameEn: 'Fattah',
    category: 'missiles',
    type: 'موشک بالستیک هایپرسونیک',
    range: 1400,
    image: 'https://picsum.photos/seed/fattah-2/800/600',
    features: ['هایپرسونیک', 'مانورپذیر', 'دقت بالا'],
    year: 1402,
    status: 'عملیاتی',
    specs: {
      speed: 'ماخ ۱۵',
      warhead: '۵۰۰ کیلوگرم',
      guidance: 'اینرسی + ترمینال'
    }
  },
  {
    id: 'kheibar-shekan',
    name: 'خیبرشکن',
    nameEn: 'Kheibar Shekan',
    category: 'missiles',
    type: 'موشک بالستیک',
    range: 1450,
    image: 'https://picsum.photos/seed/kheibar-1/800/600',
    features: ['سوخت جامد', 'سریع الاستقرار', 'دقیق'],
    year: 1401,
    status: 'عملیاتی',
    specs: {
      speed: 'ماخ ۱۲',
      warhead: '۵۰۰ کیلوگرم',
      guidance: 'اینرسی + GPS'
    }
  },
  {
    id: 'shahed-136',
    name: 'شاهد ۱۳۶',
    nameEn: 'Shahed 136',
    category: 'drones',
    type: 'پهپاد انتحاری',
    range: 2500,
    image: 'https://picsum.photos/seed/shahed-1/800/600',
    features: ['بال دلتا', 'کم‌هزینه', 'دسته‌ای'],
    year: 1400,
    status: 'عملیاتی',
    specs: {
      speed: '۱۸۵ کیلومتر/ساعت',
      warhead: '۴۰ کیلوگرم',
      endurance: '۱۲ ساعت'
    }
  },
  {
    id: 'mohajer-6',
    name: 'مهاجر ۶',
    nameEn: 'Mohajer 6',
    category: 'drones',
    type: 'پهپاد شناسایی-رزمی',
    range: 200,
    image: 'https://picsum.photos/seed/mohajer-1/800/600',
    features: ['چندمنظوره', 'مسلح', 'شناسایی'],
    year: 1396,
    status: 'عملیاتی',
    specs: {
      speed: '۲۰۰ کیلومتر/ساعت',
      payload: '۴۰ کیلوگرم',
      endurance: '۱۲ ساعت'
    }
  },
  {
    id: 'bavar-373',
    name: 'باور ۳۷۳',
    nameEn: 'Bavar 373',
    category: 'defense',
    type: 'سامانه پدافند موشکی',
    range: 300,
    image: 'https://picsum.photos/seed/bavar-1/800/600',
    features: ['بردبلند', 'رهگیری همزمان', 'بومی'],
    year: 1398,
    status: 'عملیاتی',
    specs: {
      targets: '۶ هدف همزمان',
      altitude: '۲۷ کیلومتر',
      missiles: 'صیاد ۴'
    }
  },
  {
    id: 'khordad-15',
    name: 'خرداد ۱۵',
    nameEn: 'Khordad 15',
    category: 'defense',
    type: 'سامانه پدافند',
    range: 150,
    image: 'https://picsum.photos/seed/khordad-1/800/600',
    features: ['متحرک', 'واکنش سریع', 'ضد استیلث'],
    year: 1398,
    status: 'عملیاتی',
    specs: {
      targets: '۶ هدف همزمان',
      altitude: '۲۵ کیلومتر',
      setup: '۵ دقیقه'
    }
  },
  {
    id: 'fateh-110',
    name: 'فاتح ۱۱۰',
    nameEn: 'Fateh 110',
    category: 'missiles',
    type: 'موشک بالستیک کوتاه‌برد',
    range: 300,
    image: 'https://picsum.photos/seed/fateh-1/800/600',
    features: ['دقیق', 'سوخت جامد', 'متحرک'],
    year: 1381,
    status: 'عملیاتی',
    specs: {
      speed: 'ماخ ۴',
      warhead: '۵۰۰ کیلوگرم',
      CEP: '۱۰ متر'
    }
  },
  {
    id: 'nazir',
    name: 'نذیر',
    nameEn: 'Nazir',
    category: 'naval',
    type: 'موشک کروز ضدکشتی',
    range: 100,
    image: 'https://picsum.photos/seed/nazir-1/800/600',
    features: ['ضدکشتی', 'پرتاب از ساحل', 'سریع'],
    year: 1400,
    status: 'عملیاتی',
    specs: {
      speed: 'ماخ ۲',
      warhead: '۱۵۰ کیلوگرم',
      guidance: 'اکتیو رادار'
    }
  },
]

export default function ArsenalPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedWeapon, setSelectedWeapon] = useState<typeof weapons[0] | null>(null)

  const filteredWeapons = selectedCategory === 'all' 
    ? weapons 
    : weapons.filter(w => w.category === selectedCategory)

  return (
    <AppShell>
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">آرسنال دفاعی</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          مروری بر تسلیحات پیشرفته جمهوری اسلامی ایران
        </p>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                  ${isActive 
                    ? 'bg-[var(--color-gold)] text-[var(--color-ink)]' 
                    : 'bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-ink-muted)]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[var(--color-gold)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)]">تعداد سامانه</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{toPersianNumber(filteredWeapons.length)}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--color-ink-border)]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-emerald)]/10 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-[var(--color-emerald-light)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)]">عملیاتی</p>
              <p className="text-lg font-bold text-[var(--color-emerald-light)]">{toPersianNumber(filteredWeapons.filter(w => w.status === 'عملیاتی').length)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weapons Grid */}
      <motion.div 
        className="px-4 pb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredWeapons.map((weapon, index) => (
              <motion.div
                key={weapon.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <WeaponCard 
                  weapon={weapon} 
                  onClick={() => setSelectedWeapon(weapon)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Weapon Detail Modal */}
      <AnimatePresence>
        {selectedWeapon && (
          <WeaponModal 
            weapon={selectedWeapon} 
            onClose={() => setSelectedWeapon(null)} 
          />
        )}
      </AnimatePresence>
    </AppShell>
  )
}

// Weapon Card Component
function WeaponCard({ weapon, onClick }: { weapon: typeof weapons[0], onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-right group"
    >
      <div className="relative rounded-2xl overflow-hidden bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)] card-hover">
        {/* Image */}
        <div className="relative aspect-[4/3]">
          <Image
            src={weapon.image}
            alt={weapon.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full bg-[var(--color-emerald)]/90 text-white text-xs font-medium">
              {weapon.status}
            </span>
          </div>

          {/* Year Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-full bg-black/50 text-white text-xs">
              {toPersianNumber(weapon.year)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-gold)] transition-colors">
                {weapon.name}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">{weapon.nameEn}</p>
            </div>
            <ChevronLeft className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-gold)] transition-colors" />
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{weapon.type}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {weapon.features.map((feature) => (
              <span 
                key={feature}
                className="px-2 py-0.5 rounded-full bg-[var(--color-ink-muted)] text-[var(--color-text-secondary)] text-xs"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Range */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-ink-border)]">
            <span className="text-xs text-[var(--color-text-tertiary)]">برد عملیاتی</span>
            <span className="text-sm font-bold text-[var(--color-gold)]">
              {toPersianNumber(weapon.range)} کیلومتر
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

// Weapon Modal Component
function WeaponModal({ weapon, onClose }: { weapon: typeof weapons[0], onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-[var(--color-ink)] rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="sticky top-0 bg-[var(--color-ink)] pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[var(--color-ink-muted)]" />
        </div>

        {/* Image */}
        <div className="relative aspect-[16/9] mx-4 rounded-2xl overflow-hidden">
          <Image
            src={weapon.image}
            alt={weapon.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] to-transparent" />
          
          <div className="absolute bottom-4 right-4">
            <span className="px-3 py-1.5 rounded-full bg-[var(--color-emerald)] text-white text-sm font-medium">
              {weapon.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{weapon.name}</h2>
              <p className="text-sm text-[var(--color-text-tertiary)]">{weapon.nameEn}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] text-sm">
              {toPersianNumber(weapon.year)}
            </span>
          </div>

          <p className="text-[var(--color-text-secondary)] mb-6">{weapon.type}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-6">
            {weapon.features.map((feature) => (
              <span 
                key={feature}
                className="px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-sm font-medium"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-1">برد عملیاتی</p>
              <p className="text-xl font-bold text-[var(--color-gold)]">{toPersianNumber(weapon.range)} کیلومتر</p>
            </div>
            {Object.entries(weapon.specs).map(([key, value]) => (
              <div key={key} className="p-4 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">{getSpecLabel(key)}</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-[var(--color-ink)]"
            >
              <Info className="w-4 h-4 ml-2" />
              اطلاعات کامل
            </Button>
            <Button 
              variant="outline"
              className="border-[var(--color-ink-border)]"
              onClick={onClose}
            >
              بستن
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function getSpecLabel(key: string): string {
  const labels: Record<string, string> = {
    speed: 'سرعت',
    warhead: 'کلاهک',
    guidance: 'هدایت',
    targets: 'اهداف',
    altitude: 'ارتفاع',
    missiles: 'موشک',
    setup: 'استقرار',
    payload: 'بارگذاری',
    endurance: 'پایداری',
    CEP: 'دقت (CEP)'
  }
  return labels[key] || key
}
