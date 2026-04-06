'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowLeft, FileText, Download, Play, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/atoms/Badge'
import { GoldBar, GoldDivider } from '@/components/atoms/GoldDivider'
import { PersianDate } from '@/components/atoms/PersianDate'
import { toPersianDigits } from '@/lib/persian-utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

export interface Document {
  id: string
  title: string
  type: 'pdf' | 'video' | 'image'
  thumbnail: string
  date: Date
  downloadCount: number
  duration?: string // for videos
}

const typeConfig = {
  pdf: { label: 'PDF', icon: FileText, color: 'crimson' as const },
  video: { label: 'ویدئو', icon: Play, color: 'blue' as const },
  image: { label: 'تصویر', icon: ImageIcon, color: 'gold' as const },
}

interface DocumentCardProps {
  document: Document
  featured?: boolean
}

function DocumentCard({ document, featured = false }: DocumentCardProps) {
  const config = typeConfig[document.type]
  const Icon = config.icon

  if (featured) {
    return (
      <Link href={`/documents/${document.id}`} className="group block h-full">
        <motion.div
          variants={staggerItem}
          className="relative h-full min-h-[400px] rounded-xl overflow-hidden"
        >
          {/* Thumbnail */}
          <Image
            src={document.thumbnail}
            fill
            alt={document.title}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2E] via-[#0D1B2E]/50 to-transparent" />

          {/* Type Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant={config.color}>
              <Icon className="w-3 h-3 ml-1" />
              {config.label}
            </Badge>
          </div>

          {/* Play Button for Videos */}
          {document.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-gold)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-[var(--color-ink)] mr-[-2px]" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 right-0 left-0 p-6">
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3 group-hover:text-[var(--color-gold)] transition-colors">
              {document.title}
            </h3>
            <div className="flex items-center justify-between">
              <PersianDate date={document.date} format="short" />
              <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
                <Download className="w-4 h-4" />
                <span className="text-sm">{toPersianDigits(document.downloadCount)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/documents/${document.id}`} className="group block">
      <motion.div
        variants={staggerItem}
        className="relative aspect-square rounded-lg overflow-hidden"
      >
        {/* Thumbnail */}
        <Image
          src={document.thumbnail}
          fill
          alt={document.title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-[#0D1B2E]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
          <Icon className="w-8 h-8 text-[var(--color-gold)] mb-2" />
          <p className="text-sm text-[var(--color-text-primary)] text-center line-clamp-2">
            {document.title}
          </p>
        </div>

        {/* Type indicator */}
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 rounded bg-[var(--color-ink)]/80 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--color-gold)]" />
          </div>
        </div>

        {/* Duration for videos */}
        {document.type === 'video' && document.duration && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[var(--color-ink)]/80 text-xs text-[var(--color-text-primary)]">
            {document.duration}
          </div>
        )}
      </motion.div>
    </Link>
  )
}

interface DocumentsPreviewProps {
  documents: Document[]
}

export function DocumentsPreview({ documents }: DocumentsPreviewProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [featured, ...rest] = documents
  const gridDocs = rest.slice(0, 4)

  return (
    <section ref={ref} className="py-20 px-4 lg:px-8 bg-[#0A1520]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <GoldBar />
            <h2 className="text-display-md font-bold text-[var(--color-text-primary)]">آرشیو مستندات</h2>
          </div>
          <Link
            href="/documents"
            className="text-[var(--color-gold)] text-sm flex items-center gap-2 hover:gap-3 transition-all group"
          >
            مشاهده همه
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* Layout: Featured + Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Featured Document */}
          {featured && (
            <DocumentCard document={featured} featured />
          )}

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            {gridDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gold Divider */}
      <GoldDivider className="mt-20 max-w-7xl mx-auto px-4 lg:px-8" />
    </section>
  )
}
