"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Play, 
  FileText, 
  ImageIcon, 
  Download, 
  Eye,
  Clock,
  Filter,
  Grid,
  List,
  X
} from 'lucide-react'
import { AppShell } from '@/components/organisms/AppShell'
import { Button } from '@/components/ui/button'
import { toPersianNumber, toPersianDate } from '@/lib/persian-utils'

// Document types
const documentTypes = [
  { id: 'all', label: 'همه', icon: Grid },
  { id: 'video', label: 'ویدیو', icon: Play },
  { id: 'pdf', label: 'سند', icon: FileText },
  { id: 'image', label: 'تصویر', icon: ImageIcon },
]

// Documents data
const documents = [
  {
    id: '1',
    title: 'مستند عملیات وعده صادق',
    description: 'مستند کامل از عملیات تاریخی وعده صادق و حمله موشکی به رژیم صهیونیستی',
    type: 'video',
    thumbnail: 'https://picsum.photos/seed/doc-vid-1/800/450',
    date: new Date('2024-04-14'),
    duration: '۴۵:۳۰',
    views: 125400,
    downloads: 34500,
    featured: true,
  },
  {
    id: '2',
    title: 'گزارش سالانه دفاعی ۱۴۰۲',
    description: 'گزارش جامع از دستاوردهای دفاعی جمهوری اسلامی ایران در سال ۱۴۰۲',
    type: 'pdf',
    thumbnail: 'https://picsum.photos/seed/doc-pdf-1/800/450',
    date: new Date('2024-03-20'),
    pages: 156,
    views: 45600,
    downloads: 12300,
    featured: true,
  },
  {
    id: '3',
    title: 'تصاویر رزمایش ولایت ۴۰۱',
    description: 'آلبوم تصاویر از رزمایش بزرگ ولایت ۴۰۱ با حضور نیروهای سه‌گانه',
    type: 'image',
    thumbnail: 'https://picsum.photos/seed/doc-img-1/800/450',
    date: new Date('2024-02-15'),
    count: 87,
    views: 67800,
    downloads: 8900,
    featured: false,
  },
  {
    id: '4',
    title: 'مستند نیروی دریایی راهبردی',
    description: 'معرفی ناوگان نیروی دریایی ارتش و سپاه در آبهای بین‌المللی',
    type: 'video',
    thumbnail: 'https://picsum.photos/seed/doc-vid-2/800/450',
    date: new Date('2024-01-28'),
    duration: '۳۲:۱۵',
    views: 89700,
    downloads: 21400,
    featured: false,
  },
  {
    id: '5',
    title: 'گزارش پیشرفت صنایع موشکی',
    description: 'بررسی پیشرفت‌های اخیر در حوزه موشک‌های بالستیک و کروز',
    type: 'pdf',
    thumbnail: 'https://picsum.photos/seed/doc-pdf-2/800/450',
    date: new Date('2024-01-10'),
    pages: 78,
    views: 56700,
    downloads: 15600,
    featured: false,
  },
  {
    id: '6',
    title: 'آرشیو تصاویر پدافند هوایی',
    description: 'مجموعه تصاویر از سامانه‌های پدافندی کشور',
    type: 'image',
    thumbnail: 'https://picsum.photos/seed/doc-img-2/800/450',
    date: new Date('2023-12-05'),
    count: 124,
    views: 34500,
    downloads: 7800,
    featured: false,
  },
  {
    id: '7',
    title: 'مستند پهپادهای ایرانی',
    description: 'معرفی انواع پهپادهای شناسایی و رزمی ساخت ایران',
    type: 'video',
    thumbnail: 'https://picsum.photos/seed/doc-vid-3/800/450',
    date: new Date('2023-11-20'),
    duration: '۲۸:۴۵',
    views: 112300,
    downloads: 28900,
    featured: false,
  },
  {
    id: '8',
    title: 'کتاب دکترین دفاعی ایران',
    description: 'کتاب الکترونیکی درباره استراتژی دفاعی جمهوری اسلامی',
    type: 'pdf',
    thumbnail: 'https://picsum.photos/seed/doc-pdf-3/800/450',
    date: new Date('2023-10-15'),
    pages: 234,
    views: 78900,
    downloads: 45600,
    featured: false,
  },
]

// Timeline events
const timelineEvents = [
  { year: 1402, title: 'عملیات وعده صادق', description: 'اولین حمله مستقیم موشکی به رژیم صهیونیستی' },
  { year: 1401, title: 'رونمایی از موشک فتاح', description: 'اولین موشک هایپرسونیک ایران' },
  { year: 1400, title: 'معرفی شاهد ۱۳۶', description: 'پهپاد انتحاری با برد ۲۵۰۰ کیلومتر' },
  { year: 1398, title: 'سرنگونی پهپاد آمریکایی', description: 'سامانه خرداد ۱۵ پهپاد گلوبال‌هاوک را منهدم کرد' },
  { year: 1396, title: 'حمله موشکی به داعش', description: 'شلیک موشک‌های زمین‌به‌زمین به مواضع داعش' },
]

export default function DocumentsPage() {
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null)
  const [activeTab, setActiveTab] = useState<'documents' | 'timeline'>('documents')

  const filteredDocs = selectedType === 'all' 
    ? documents 
    : documents.filter(d => d.type === selectedType)

  const featuredDocs = filteredDocs.filter(d => d.featured)
  const regularDocs = filteredDocs.filter(d => !d.featured)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play
      case 'pdf': return FileText
      case 'image': return ImageIcon
      default: return FileText
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'ویدیو'
      case 'pdf': return 'سند'
      case 'image': return 'تصویر'
      default: return ''
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-600'
      case 'pdf': return 'bg-blue-600'
      case 'image': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <AppShell>
      {/* Tab Switcher */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex gap-2 p-1 bg-[var(--color-ink-raised)] rounded-xl">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'documents'
                ? 'bg-[var(--color-gold)] text-[var(--color-ink)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            مستندات
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'timeline'
                ? 'bg-[var(--color-gold)] text-[var(--color-ink)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            تاریخچه
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'documents' ? (
          <motion.div
            key="documents"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Filters */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {documentTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                          selectedType === type.id
                            ? 'bg-[var(--color-gold)] text-[var(--color-ink)]'
                            : 'bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {type.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-1 mr-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-[var(--color-ink-muted)]' : ''
                    }`}
                  >
                    <Grid className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-[var(--color-ink-muted)]' : ''
                    }`}
                  >
                    <List className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {toPersianNumber(filteredDocs.length)} مورد
              </p>
            </div>

            {/* Featured Documents */}
            {featuredDocs.length > 0 && (
              <div className="px-4 pb-4">
                <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-3">پیشنهادی</h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                  {featuredDocs.map((doc) => {
                    const TypeIcon = getTypeIcon(doc.type)
                    return (
                      <motion.button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className="shrink-0 w-64 text-right"
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative rounded-xl overflow-hidden card-hover">
                          <div className="relative aspect-video">
                            <Image
                              src={doc.thumbnail}
                              alt={doc.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            
                            {/* Type Badge */}
                            <div className={`absolute top-2 right-2 ${getTypeColor(doc.type)} px-2 py-1 rounded-full flex items-center gap-1`}>
                              <TypeIcon className="w-3 h-3 text-white" />
                              <span className="text-xs text-white">{getTypeLabel(doc.type)}</span>
                            </div>

                            {/* Duration/Pages/Count */}
                            {doc.type === 'video' && doc.duration && (
                              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
                                {doc.duration}
                              </div>
                            )}

                            <div className="absolute bottom-2 right-2 left-10">
                              <h3 className="text-sm font-bold text-white line-clamp-1">{doc.title}</h3>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Documents Grid/List */}
            <div className="px-4 pb-8">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                  {regularDocs.map((doc, index) => {
                    const TypeIcon = getTypeIcon(doc.type)
                    return (
                      <motion.button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-right"
                      >
                        <div className="bg-[var(--color-ink-raised)] rounded-xl overflow-hidden border border-[var(--color-ink-border)] card-hover">
                          <div className="relative aspect-video">
                            <Image
                              src={doc.thumbnail}
                              alt={doc.title}
                              fill
                              className="object-cover"
                            />
                            <div className={`absolute top-2 right-2 ${getTypeColor(doc.type)} w-7 h-7 rounded-full flex items-center justify-center`}>
                              <TypeIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 mb-1">{doc.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                              <Eye className="w-3 h-3" />
                              <span>{toPersianNumber(doc.views)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {regularDocs.map((doc, index) => {
                    const TypeIcon = getTypeIcon(doc.type)
                    return (
                      <motion.button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-full text-right"
                      >
                        <div className="flex gap-3 bg-[var(--color-ink-raised)] rounded-xl p-3 border border-[var(--color-ink-border)] card-hover">
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={doc.thumbnail}
                              alt={doc.title}
                              fill
                              className="object-cover"
                            />
                            <div className={`absolute top-1 right-1 ${getTypeColor(doc.type)} w-5 h-5 rounded-full flex items-center justify-center`}>
                              <TypeIcon className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1 mb-1">{doc.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {toPersianNumber(doc.views)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                {toPersianNumber(doc.downloads)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Timeline Tab */
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 pb-8"
          >
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">تاریخچه دفاعی ایران</h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-[var(--color-ink-border)]" />

              {/* Events */}
              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <motion.div
                    key={event.year}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pr-12"
                  >
                    {/* Year Circle */}
                    <div className="absolute right-0 w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--color-ink)]">{toPersianNumber(event.year % 100)}</span>
                    </div>

                    {/* Content */}
                    <div className="bg-[var(--color-ink-raised)] rounded-xl p-4 border border-[var(--color-ink-border)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-[var(--color-gold)]" />
                        <span className="text-sm text-[var(--color-gold)]">{toPersianNumber(event.year)}</span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">{event.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">{event.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Detail Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <DocumentModal 
            document={selectedDoc} 
            onClose={() => setSelectedDoc(null)} 
          />
        )}
      </AnimatePresence>
    </AppShell>
  )
}

// Document Modal Component
function DocumentModal({ document, onClose }: { document: typeof documents[0], onClose: () => void }) {
  const TypeIcon = document.type === 'video' ? Play : document.type === 'pdf' ? FileText : ImageIcon

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
        className="fixed inset-x-0 bottom-0 z-50 bg-[var(--color-ink)] rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="sticky top-0 bg-[var(--color-ink)] pt-3 pb-2 flex justify-center z-10">
          <div className="w-10 h-1 rounded-full bg-[var(--color-ink-muted)]" />
        </div>

        {/* Image */}
        <div className="relative aspect-video mx-4 rounded-xl overflow-hidden">
          <Image
            src={document.thumbnail}
            alt={document.title}
            fill
            className="object-cover"
          />
          {document.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-7 h-7 text-[var(--color-ink)] mr-[-2px]" fill="currentColor" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${
              document.type === 'video' ? 'bg-red-600' : 
              document.type === 'pdf' ? 'bg-blue-600' : 'bg-green-600'
            } flex items-center justify-center shrink-0`}>
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{document.title}</h2>
              <p className="text-sm text-[var(--color-text-tertiary)]">{toPersianDate(document.date)}</p>
            </div>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] mb-6">{document.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] text-center">
              <Eye className="w-5 h-5 text-[var(--color-gold)] mx-auto mb-1" />
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{toPersianNumber(document.views)}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">بازدید</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] text-center">
              <Download className="w-5 h-5 text-[var(--color-gold)] mx-auto mb-1" />
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{toPersianNumber(document.downloads)}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">دانلود</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] text-center">
              <TypeIcon className="w-5 h-5 text-[var(--color-gold)] mx-auto mb-1" />
              <p className="text-lg font-bold text-[var(--color-text-primary)]">
                {document.type === 'video' ? document.duration : 
                 document.type === 'pdf' ? `${toPersianNumber(document.pages || 0)} صفحه` : 
                 `${toPersianNumber(document.count || 0)} عکس`}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {document.type === 'video' ? 'مدت' : document.type === 'pdf' ? 'حجم' : 'تعداد'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-[var(--color-ink)]"
            >
              {document.type === 'video' ? (
                <>
                  <Play className="w-4 h-4 ml-2" />
                  پخش ویدیو
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 ml-2" />
                  دانلود
                </>
              )}
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
