"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  Bookmark,
  X,
  TrendingUp
} from 'lucide-react'
import { AppShell } from '@/components/organisms/AppShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toPersianNumber } from '@/lib/persian-utils'

// News categories
const categories = [
  { id: 'all', label: 'همه' },
  { id: 'military', label: 'نظامی' },
  { id: 'tech', label: 'فناوری' },
  { id: 'analysis', label: 'تحلیل' },
  { id: 'regional', label: 'منطقه‌ای' },
]

// News data
const allNews = [
  {
    id: '1',
    title: 'عملیات موفق پدافند هوایی در خلیج فارس: رهگیری و انهدام پهپادهای متجاوز',
    excerpt: 'نیروهای مسلح جمهوری اسلامی ایران با موفقیت چندین پهپاد متخاصم را در آبهای خلیج فارس رهگیری و منهدم کردند.',
    category: 'military',
    categoryLabel: 'نظامی',
    date: '۲ ساعت پیش',
    readingTime: 5,
    views: 12540,
    image: 'https://picsum.photos/seed/news-def-1/800/600',
    isLive: true,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'رونمایی از سامانه رادار بومی با قابلیت رهگیری اهداف کم‌ارتفاع',
    excerpt: 'این سامانه قادر است اهداف در ارتفاع پایین و با سطح رادار کوچک را شناسایی کند.',
    category: 'tech',
    categoryLabel: 'فناوری',
    date: '۵ ساعت پیش',
    readingTime: 4,
    views: 8320,
    image: 'https://picsum.photos/seed/news-tech-1/800/600',
    isFeatured: false,
  },
  {
    id: '3',
    title: 'تحلیل وضعیت امنیتی منطقه پس از تحولات اخیر',
    excerpt: 'بررسی تأثیر تحولات اخیر بر موازنه قدرت در منطقه غرب آسیا.',
    category: 'analysis',
    categoryLabel: 'تحلیل',
    date: '۱ روز پیش',
    readingTime: 12,
    views: 15680,
    image: 'https://picsum.photos/seed/news-analysis-1/800/600',
    isFeatured: false,
  },
  {
    id: '4',
    title: 'برگزاری رزمایش مشترک نیروهای زمینی و هوایی در غرب کشور',
    excerpt: 'این رزمایش با هدف ارتقای هماهنگی بین نیروهای مسلح برگزار شد.',
    category: 'military',
    categoryLabel: 'نظامی',
    date: '۲ روز پیش',
    readingTime: 6,
    views: 9870,
    image: 'https://picsum.photos/seed/news-mil-2/800/600',
    isFeatured: false,
  },
  {
    id: '5',
    title: 'صادرات تجهیزات دفاعی ایران به کشورهای منطقه افزایش یافت',
    excerpt: 'آمار صادرات تجهیزات نظامی در سال جاری رشد قابل توجهی داشته است.',
    category: 'regional',
    categoryLabel: 'منطقه‌ای',
    date: '۳ روز پیش',
    readingTime: 8,
    views: 7650,
    image: 'https://picsum.photos/seed/news-reg-1/800/600',
    isFeatured: false,
  },
  {
    id: '6',
    title: 'تقویت زیرساخت‌های دفاع سایبری کشور در مقابل تهدیدات خارجی',
    excerpt: 'سامانه‌های جدید دفاع سایبری با هدف مقابله با حملات پیچیده راه‌اندازی شدند.',
    category: 'tech',
    categoryLabel: 'فناوری',
    date: '۴ روز پیش',
    readingTime: 7,
    views: 6540,
    image: 'https://picsum.photos/seed/news-cyber-1/800/600',
    isFeatured: false,
  },
  {
    id: '7',
    title: 'تمرین مشترک نیروی دریایی ایران و روسیه در دریای خزر',
    excerpt: 'این تمرین با هدف ارتقای همکاری‌های دفاعی دو کشور برگزار شد.',
    category: 'regional',
    categoryLabel: 'منطقه‌ای',
    date: '۵ روز پیش',
    readingTime: 5,
    views: 11230,
    image: 'https://picsum.photos/seed/news-navy-1/800/600',
    isFeatured: false,
  },
  {
    id: '8',
    title: 'آینده جنگ‌افزارهای هوشمند: نگاهی به پیشرفت‌های اخیر',
    excerpt: 'تحلیلی از روند توسعه سلاح‌های هوشمند و تأثیر آن بر دکترین نظامی.',
    category: 'analysis',
    categoryLabel: 'تحلیل',
    date: '۱ هفته پیش',
    readingTime: 15,
    views: 18920,
    image: 'https://picsum.photos/seed/news-smart-1/800/600',
    isFeatured: false,
  },
]

// Trending topics
const trending = [
  'پدافند هوایی',
  'موشک فتاح',
  'رزمایش',
  'پهپاد شاهد',
  'دریای سرخ',
]

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [savedNews, setSavedNews] = useState<string[]>([])

  const filteredNews = useMemo(() => {
    return allNews.filter((news) => {
      const matchesSearch = searchQuery === '' || 
        news.title.includes(searchQuery) ||
        news.excerpt.includes(searchQuery)
      
      const matchesCategory = selectedCategory === 'all' || 
        news.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const featuredNews = filteredNews.find(n => n.isFeatured)
  const regularNews = filteredNews.filter(n => !n.isFeatured)

  const toggleSave = (id: string) => {
    setSavedNews(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  return (
    <AppShell>
      {/* Search Header */}
      <div className="px-4 pt-4 pb-3 sticky top-14 bg-[var(--color-ink)] z-30">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
            <Input
              type="text"
              placeholder="جستجو در اخبار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 bg-[var(--color-ink-raised)] border-[var(--color-ink-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`
              border-[var(--color-ink-border)]
              ${showFilters ? 'bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold)]' : ''}
            `}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Trending */}
        {!searchQuery && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
            <TrendingUp className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" />
            {trending.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1 rounded-full bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)] text-xs whitespace-nowrap hover:bg-[var(--color-ink-muted)] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[var(--color-ink-border)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">دسته‌بندی</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm transition-all
                      ${selectedCategory === cat.id 
                        ? 'bg-[var(--color-gold)] text-[var(--color-ink)]' 
                        : 'bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)]'
                      }
                    `}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="px-4 py-3">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          {toPersianNumber(filteredNews.length)} خبر یافت شد
        </p>
      </div>

      {/* Featured News */}
      {featuredNews && !searchQuery && (
        <div className="px-4 pb-4">
          <Link href={`/news/${featuredNews.id}`}>
            <div className="relative rounded-2xl overflow-hidden card-hover">
              <div className="relative aspect-[16/9]">
                <Image
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {featuredNews.isLive && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-crimson)] text-white text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      زنده
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-0.5 rounded bg-[var(--color-gold)]/90 text-[var(--color-ink)] text-xs font-medium mb-2">
                    {featuredNews.categoryLabel}
                  </span>
                  <h2 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {featuredNews.title}
                  </h2>
                  <div className="flex items-center gap-4 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredNews.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {toPersianNumber(featuredNews.views)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* News List */}
      <div className="px-4 pb-8">
        <div className="space-y-4">
          {regularNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex gap-3 bg-[var(--color-ink-raised)] rounded-xl p-3 border border-[var(--color-ink-border)] card-hover">
                <Link href={`/news/${news.id}`} className="shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      src={news.image}
                      alt={news.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/news/${news.id}`} className="flex-1">
                      <span className="text-xs text-[var(--color-gold)]">{news.categoryLabel}</span>
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-2 mt-1 hover:text-[var(--color-gold)] transition-colors">
                        {news.title}
                      </h3>
                    </Link>
                    <button
                      onClick={() => toggleSave(news.id)}
                      className="p-1 shrink-0"
                    >
                      <Bookmark 
                        className={`w-4 h-4 transition-colors ${
                          savedNews.includes(news.id) 
                            ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' 
                            : 'text-[var(--color-text-tertiary)]'
                        }`} 
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {news.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {toPersianNumber(news.views)}
                    </span>
                    <span>{toPersianNumber(news.readingTime)} دقیقه</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No results */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)]">خبری یافت نشد</p>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
              عبارت جستجو را تغییر دهید
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
