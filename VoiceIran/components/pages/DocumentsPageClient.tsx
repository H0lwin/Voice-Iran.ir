"use client"

import {useMemo, useState} from "react"
import Image from "next/image"
import Link from "next/link"
import {AnimatePresence, motion} from "framer-motion"
import {AppShell} from "@/components/organisms/AppShell"
import {Button} from "@/components/ui/button"
import {Clock, Download, Eye, FileText, Grid, ImageIcon, List, Play, X} from "lucide-react"
import {formatDateByLocale, formatNumberByLocale} from "@/lib/i18n"
import type {AppLocale} from "@/i18n/routing"
import type {DocumentItem, DocumentsOverviewPayload} from "@/lib/api"

type Props = {
  locale: AppLocale
  data: DocumentsOverviewPayload
}

type DocCopy = {
  docs: string
  timeline: string
  suggested: string
  items: string
  views: string
  downloads: string
  duration: string
  pages: string
  photos: string
  close: string
  play: string
  download: string
  defensiveHistory: string
}

const copy: Record<AppLocale, DocCopy> = {
  fa: {
    docs: "مستندات",
    timeline: "تاریخچه",
    suggested: "پیشنهادی",
    items: "مورد",
    views: "بازدید",
    downloads: "دانلود",
    duration: "مدت",
    pages: "صفحه",
    photos: "عکس",
    close: "بستن",
    play: "پخش ویدیو",
    download: "دانلود",
    defensiveHistory: "تاریخچه دفاعی ایران",
  },
  en: {
    docs: "Documents",
    timeline: "Timeline",
    suggested: "Suggested",
    items: "items",
    views: "Views",
    downloads: "Downloads",
    duration: "Duration",
    pages: "pages",
    photos: "photos",
    close: "Close",
    play: "Play Video",
    download: "Download",
    defensiveHistory: "Iran Defense Timeline",
  },
}

function iconForType(type: string) {
  if (type === "video" || type === "seed-video") return Play
  if (type === "image" || type === "seed-image") return ImageIcon
  return FileText
}

function typePillClass(type: string) {
  if (type === "video" || type === "seed-video") return "bg-red-600"
  if (type === "image" || type === "seed-image") return "bg-green-600"
  return "bg-blue-600"
}

export function DocumentsPageClient({locale, data}: Props) {
  const t = copy[locale]
  const [selectedType, setSelectedType] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<"documents" | "timeline">("documents")
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null)

  const featured = useMemo(
    () =>
      selectedType === "all"
        ? data.featured
        : data.featured.filter((doc) => doc.type === selectedType),
    [data.featured, selectedType]
  )
  const items = useMemo(
    () =>
      selectedType === "all"
        ? data.items
        : data.items.filter((doc) => doc.type === selectedType),
    [data.items, selectedType]
  )

  return (
    <AppShell>
      <div className="px-4 pt-4 pb-3 max-w-6xl mx-auto w-full">
        <div className="flex gap-2 p-1 bg-[var(--color-ink-raised)] rounded-xl">
          <button
            onClick={() => setActiveTab("documents")}
            className={activeTab === "documents" ? "flex-1 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-gold)] text-[var(--color-ink)]" : "flex-1 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)]"}
          >
            {t.docs}
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={activeTab === "timeline" ? "flex-1 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-gold)] text-[var(--color-ink)]" : "flex-1 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)]"}
          >
            {t.timeline}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "documents" ? (
          <motion.div
            key="documents"
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 20}}
            transition={{duration: 0.2}}
          >
          <div className="px-4 pb-3 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {data.filters.types.map((type) => {
                  const Icon = iconForType(type.id)
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={selectedType === type.id ? "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap bg-[var(--color-gold)] text-[var(--color-ink)]" : "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap bg-[var(--color-ink-raised)] text-[var(--color-text-secondary)]"}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {type.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-1 ms-2">
                <button onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "p-2 rounded-lg bg-[var(--color-ink-muted)]" : "p-2 rounded-lg"}>
                  <Grid className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </button>
                <button onClick={() => setViewMode("list")} className={viewMode === "list" ? "p-2 rounded-lg bg-[var(--color-ink-muted)]" : "p-2 rounded-lg"}>
                  <List className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </button>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">{formatNumberByLocale(items.length + featured.length, locale)} {t.items}</p>
          </div>

          {featured.length > 0 && (
            <div className="px-4 pb-4 max-w-6xl mx-auto w-full">
              <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-3">{t.suggested}</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {featured.map((doc) => {
                  const TypeIcon = iconForType(doc.type || "")
                  const pill = typePillClass(doc.type || "")
                  return (
                    <button key={String(doc.id)} onClick={() => setSelectedDoc(doc)} className="shrink-0 w-64 text-start">
                      <div className="relative rounded-xl overflow-hidden">
                        <div className="relative aspect-video">
                          <Image src={doc.thumbnail || "/images/placeholder-media.svg"} alt={doc.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className={`absolute top-2 end-2 ${pill} px-2 py-1 rounded-full flex items-center gap-1`}>
                            <TypeIcon className="w-3 h-3 text-white" />
                            <span className="text-xs text-white">{doc.type_label || doc.type || ""}</span>
                          </div>
                          <div className="absolute bottom-2 inset-x-2">
                            <h3 className="text-sm font-bold text-white line-clamp-1">{doc.title}</h3>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="px-4 pb-8 max-w-6xl mx-auto w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3">
                {items.map((doc) => {
                  const TypeIcon = iconForType(doc.type || "")
                  const pill = typePillClass(doc.type || "")
                  return (
                    <button key={String(doc.id)} onClick={() => setSelectedDoc(doc)} className="text-start">
                      <article className="bg-[var(--color-ink-raised)] rounded-xl overflow-hidden border border-[var(--color-ink-border)] card-hover">
                        <div className="relative aspect-video">
                          <Image src={doc.thumbnail || "/images/placeholder-media.svg"} alt={doc.title} fill className="object-cover" />
                          <div className={`absolute top-2 end-2 w-7 h-7 rounded-full ${pill} flex items-center justify-center`}>
                            <TypeIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 mb-1">{doc.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                            <Eye className="w-3 h-3" />
                            <span>{formatNumberByLocale(doc.view_count || 0, locale)}</span>
                          </div>
                        </div>
                      </article>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((doc) => {
                  const TypeIcon = iconForType(doc.type || "")
                  const pill = typePillClass(doc.type || "")
                  return (
                    <button key={String(doc.id)} onClick={() => setSelectedDoc(doc)} className="w-full text-start">
                      <article className="flex gap-3 bg-[var(--color-ink-raised)] rounded-xl p-3 border border-[var(--color-ink-border)] card-hover">
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0">
                          <Image src={doc.thumbnail || "/images/placeholder-media.svg"} alt={doc.title} fill className="object-cover" />
                          <div className={`absolute top-1 end-1 w-5 h-5 rounded-full ${pill} flex items-center justify-center`}>
                            <TypeIcon className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1 mb-1">{doc.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumberByLocale(doc.view_count || 0, locale)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {formatNumberByLocale(doc.download_count || 0, locale)}
                            </span>
                          </div>
                        </div>
                      </article>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.2}}
            className="px-4 pb-8 max-w-6xl mx-auto w-full"
          >
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">{t.defensiveHistory}</h2>
          <div className="relative">
            <div className="absolute start-4 top-0 bottom-0 w-0.5 bg-[var(--color-ink-border)]" />
            <div className="space-y-6">
              {data.timeline.map((event) => (
                <div key={`${event.year}-${event.title}`} className="relative ps-12">
                  <div className="absolute start-0 w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center">
                    <span className="text-xs font-bold text-[var(--color-ink)]">{String(event.year).slice(-2)}</span>
                  </div>
                  <div className="bg-[var(--color-ink-raised)] rounded-xl p-4 border border-[var(--color-ink-border)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[var(--color-gold)]" />
                      <span className="text-sm text-[var(--color-gold)]">{formatNumberByLocale(event.year, locale)}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">{event.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDoc && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedDoc(null)} />
          <div className="absolute inset-x-0 bottom-0 bg-[var(--color-ink)] rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--color-ink)] pt-3 pb-2 flex justify-center z-10">
              <div className="w-10 h-1 rounded-full bg-[var(--color-ink-muted)]" />
            </div>
            <button onClick={() => setSelectedDoc(null)} className="absolute top-4 end-4 w-8 h-8 rounded-full bg-[var(--color-ink-raised)] flex items-center justify-center z-10">
              <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </button>
            <div className="relative aspect-video mx-4 rounded-xl overflow-hidden">
              <Image src={selectedDoc.thumbnail || "/images/placeholder-media.svg"} alt={selectedDoc.title} fill className="object-cover" />
              {(selectedDoc.type === "video" || selectedDoc.type === "seed-video") && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-7 h-7 text-[var(--color-ink)] ms-0.5" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-6">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{selectedDoc.title}</h2>
              <p className="text-sm text-[var(--color-text-tertiary)]">{selectedDoc.published_at ? formatDateByLocale(selectedDoc.published_at, locale) : ""}</p>
              <p className="text-sm text-[var(--color-text-secondary)] my-4">{selectedDoc.description || selectedDoc.summary || ""}</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] text-center">
                  <Eye className="w-5 h-5 text-[var(--color-gold)] mx-auto mb-1" />
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatNumberByLocale(selectedDoc.view_count || 0, locale)}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{t.views}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] text-center">
                  <Download className="w-5 h-5 text-[var(--color-gold)] mx-auto mb-1" />
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatNumberByLocale(selectedDoc.download_count || 0, locale)}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{t.downloads}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-ink-raised)] text-center">
                  <Clock className="w-5 h-5 text-[var(--color-gold)] mx-auto mb-1" />
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">{itemMetric(selectedDoc, locale, t)}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{metricLabel(selectedDoc, t)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button asChild className="flex-1 bg-[var(--color-gold)] hover:bg-[var(--color-gold-light)] text-[var(--color-ink)]">
                  <Link href={`/${locale}/documents/${selectedDoc.slug || selectedDoc.id}`}>
                    {selectedDoc.type === "video" || selectedDoc.type === "seed-video" ? t.play : t.download}
                  </Link>
                </Button>
                <Button variant="outline" className="border-[var(--color-ink-border)]" onClick={() => setSelectedDoc(null)}>
                  {t.close}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function itemMetric(doc: DocumentItem, locale: AppLocale, t: DocCopy) {
  if (doc.duration_seconds) return formatDuration(doc.duration_seconds)
  if (doc.page_count) return `${formatNumberByLocale(doc.page_count, locale)} ${t.pages}`
  if (doc.item_count) return `${formatNumberByLocale(doc.item_count, locale)} ${t.photos}`
  return "-"
}

function metricLabel(doc: DocumentItem, t: DocCopy) {
  if (doc.duration_seconds) return t.duration
  if (doc.page_count) return t.pages
  if (doc.item_count) return t.photos
  return ""
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
