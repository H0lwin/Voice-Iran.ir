"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Calendar, 
  MapPin, 
  Award,
  ChevronLeft,
  Filter,
  Heart,
  X
} from 'lucide-react'
import { AppShell } from '@/components/organisms/AppShell'
import { Button } from '@/components/ui/button'
import { toPersianNumber, toPersianDate } from '@/lib/persian-utils'

// Martyrs data
const martyrs = [
  {
    id: '1',
    name: 'شهید سردار حاج قاسم سلیمانی',
    title: 'فرمانده نیروی قدس سپاه',
    unit: 'سپاه قدس',
    rank: 'سرلشکر',
    birthDate: new Date('1957-03-11'),
    martyrdomDate: new Date('2020-01-03'),
    martyrdomLocation: 'بغداد، عراق',
    image: 'https://picsum.photos/seed/soleimani/800/1000',
    biography: 'سردار شهید حاج قاسم سلیمانی، فرمانده نیروی قدس سپاه پاسداران انقلاب اسلامی بود که در عملیات تروریستی آمریکا به شهادت رسید.',
    achievements: ['مبارزه با داعش', 'فرماندهی محور مقاومت', 'آزادسازی موصل'],
    featured: true,
  },
  {
    id: '2',
    name: 'شهید ابومهدی المهندس',
    title: 'فرمانده حشد الشعبی',
    unit: 'حشد الشعبی',
    rank: 'فرمانده',
    birthDate: new Date('1954-07-01'),
    martyrdomDate: new Date('2020-01-03'),
    martyrdomLocation: 'بغداد، عراق',
    image: 'https://picsum.photos/seed/muhandis/800/1000',
    biography: 'جمال جعفر محمد علی آل ابراهیم معروف به ابومهدی المهندس، معاون فرمانده حشد الشعبی عراق بود.',
    achievements: ['مبارزه با داعش', 'تشکیل حشد الشعبی', 'آزادسازی تکریت'],
    featured: true,
  },
  {
    id: '3',
    name: 'شهید محسن فخری‌زاده',
    title: 'دانشمند هسته‌ای',
    unit: 'وزارت دفاع',
    rank: 'سردار',
    birthDate: new Date('1958-01-01'),
    martyrdomDate: new Date('2020-11-27'),
    martyrdomLocation: 'آبسرد، دماوند',
    image: 'https://picsum.photos/seed/fakhrizadeh/800/1000',
    biography: 'دکتر محسن فخری‌زاده دانشمند هسته‌ای و فیزیک‌دان ایرانی بود که در یک عملیات ترور به شهادت رسید.',
    achievements: ['پیشرفت برنامه هسته‌ای', 'تولید واکسن کرونا', 'توسعه علم نانو'],
    featured: false,
  },
  {
    id: '4',
    name: 'شهید حسن صیاد خدایی',
    title: 'پاسدار انقلاب',
    unit: 'سپاه پاسداران',
    rank: 'سرهنگ',
    birthDate: new Date('1970-01-01'),
    martyrdomDate: new Date('2022-05-22'),
    martyrdomLocation: 'تهران',
    image: 'https://picsum.photos/seed/sayyad/800/1000',
    biography: 'شهید حسن صیاد خدایی، از پاسداران انقلاب اسلامی بود که توسط عوامل نفوذی ترور شد.',
    achievements: ['مبارزه با تروریسم', 'حفاظت از امنیت ملی'],
    featured: false,
  },
  {
    id: '5',
    name: 'شهید رضی موسوی',
    title: 'مستشار نظامی',
    unit: 'سپاه پاسداران',
    rank: 'سردار',
    birthDate: new Date('1960-01-01'),
    martyrdomDate: new Date('2023-12-25'),
    martyrdomLocation: 'دمشق، سوریه',
    image: 'https://picsum.photos/seed/mousavi/800/1000',
    biography: 'سردار شهید رضی موسوی از مستشاران نظامی ایران در سوریه بود که در حمله هوایی رژیم صهیونیستی به شهادت رسید.',
    achievements: ['مشاوره نظامی در سوریه', 'مبارزه با تروریسم تکفیری'],
    featured: false,
  },
  {
    id: '6',
    name: 'شهید محمدرضا زاهدی',
    title: 'فرمانده نیروی قدس در سوریه و لبنان',
    unit: 'سپاه قدس',
    rank: 'سردار',
    birthDate: new Date('1958-01-01'),
    martyrdomDate: new Date('2024-04-01'),
    martyrdomLocation: 'دمشق، سوریه',
    image: 'https://picsum.photos/seed/zahedi/800/1000',
    biography: 'سردار شهید محمدرضا زاهدی، فرمانده نیروی قدس در سوریه و لبنان بود.',
    achievements: ['فرماندهی جبهه مقاومت', 'هماهنگی با حزب‌الله'],
    featured: false,
  },
]

// Filter options
const units = ['همه', 'سپاه قدس', 'سپاه پاسداران', 'وزارت دفاع', 'حشد الشعبی']

export default function MartyrsPage() {
  const [selectedUnit, setSelectedUnit] = useState('همه')
  const [selectedMartyr, setSelectedMartyr] = useState<typeof martyrs[0] | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredMartyrs = selectedUnit === 'همه' 
    ? martyrs 
    : martyrs.filter(m => m.unit === selectedUnit)

  const featuredMartyrs = filteredMartyrs.filter(m => m.featured)
  const otherMartyrs = filteredMartyrs.filter(m => !m.featured)

  return (
    <AppShell>
      {/* Header with Quranic verse */}
      <div className="relative px-4 pt-4 pb-8 bg-gradient-to-b from-[var(--color-crimson)]/20 to-transparent">
        <div className="text-center mb-4">
          <p className="text-lg text-[var(--color-gold)] font-serif mb-2" dir="rtl">
            «وَ لا تَحْسَبَنَّ الَّذینَ قُتِلُوا فی سَبیلِ اللَّهِ أَمْواتاً بَلْ أَحْیاءٌ عِنْدَ رَبِّهِمْ یُرْزَقُونَ»
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)]">سوره آل‌عمران، آیه ۱۶۹</p>
        </div>
        
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-1">یادبود شهدا</h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center">
          یاد و خاطره شهدای دفاع مقدس
        </p>
      </div>

      {/* Filter */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {toPersianNumber(filteredMartyrs.length)} شهید
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)]' : 'border-[var(--color-ink-border)]'}
          >
            <Filter className="w-4 h-4 ml-2" />
            فیلتر
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 mt-4">
                {units.map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setSelectedUnit(unit)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm transition-all
                      ${selectedUnit === unit 
                        ? 'bg-[var(--color-gold)] text-[var(--color-ink)]' 
                        : 'bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)]'
                      }
                    `}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Featured Martyrs */}
      {featuredMartyrs.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-3">شهدای برجسته</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {featuredMartyrs.map((martyr) => (
              <motion.button
                key={martyr.id}
                onClick={() => setSelectedMartyr(martyr)}
                className="shrink-0 w-40 text-center"
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dim)] p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-ink)]">
                      <Image
                        src={martyr.image}
                        alt={martyr.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--color-crimson)] flex items-center justify-center border-2 border-[var(--color-ink)]">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-1">{martyr.name}</h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">{martyr.rank}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* All Martyrs Grid */}
      <div className="px-4 pb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-3">همه شهدا</h2>
        <div className="grid grid-cols-2 gap-3">
          {otherMartyrs.map((martyr, index) => (
            <motion.button
              key={martyr.id}
              onClick={() => setSelectedMartyr(martyr)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-right"
            >
              <div className="bg-[var(--color-ink-raised)] rounded-xl overflow-hidden border border-[var(--color-ink-border)] card-hover">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={martyr.image}
                    alt={martyr.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{martyr.name}</h3>
                    <p className="text-xs text-white/70">{martyr.rank} - {martyr.unit}</p>
                    <p className="text-xs text-[var(--color-gold)] mt-1">
                      {toPersianDate(martyr.martyrdomDate)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Martyr Detail Modal */}
      <AnimatePresence>
        {selectedMartyr && (
          <MartyrModal 
            martyr={selectedMartyr} 
            onClose={() => setSelectedMartyr(null)} 
          />
        )}
      </AnimatePresence>
    </AppShell>
  )
}

// Martyr Modal Component
function MartyrModal({ martyr, onClose }: { martyr: typeof martyrs[0], onClose: () => void }) {
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
        <div className="sticky top-0 bg-[var(--color-ink)] pt-3 pb-2 flex justify-center z-10">
          <div className="w-10 h-1 rounded-full bg-[var(--color-ink-muted)]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[var(--color-ink-raised)] flex items-center justify-center z-10"
        >
          <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </button>

        {/* Image */}
        <div className="px-4 mb-4">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dim)] p-1">
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  src={martyr.image}
                  alt={martyr.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-8 text-center">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{martyr.name}</h2>
          <p className="text-sm text-[var(--color-gold)] mb-4">{martyr.title}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-right">
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
              <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs">درجه</span>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{martyr.rank}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
              <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">تاریخ شهادت</span>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{toPersianDate(martyr.martyrdomDate)}</p>
            </div>
            <div className="col-span-2 p-3 rounded-xl bg-[var(--color-ink-raised)] border border-[var(--color-ink-border)]">
              <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">محل شهادت</span>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{martyr.martyrdomLocation}</p>
            </div>
          </div>

          {/* Biography */}
          <div className="text-right mb-6">
            <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-2">زندگی‌نامه</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{martyr.biography}</p>
          </div>

          {/* Achievements */}
          <div className="text-right mb-6">
            <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-2">دستاوردها</h3>
            <div className="flex flex-wrap gap-2">
              {martyr.achievements.map((achievement) => (
                <span 
                  key={achievement}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-sm"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>

          {/* Prayer */}
          <div className="p-4 rounded-xl bg-[var(--color-crimson)]/10 border border-[var(--color-crimson)]/30">
            <p className="text-sm text-[var(--color-text-secondary)] italic">
              روحش شاد و راهش پر رهرو باد
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}
