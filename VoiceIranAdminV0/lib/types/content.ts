// Content Management Types

export type ContentStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived'

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'پیش‌نویس',
  pending_review: 'در بررسی',
  published: 'منتشرشده',
  rejected: 'رد شده',
  archived: 'بایگانی',
}

export const STATUS_COLORS: Record<ContentStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-muted', text: 'text-muted-foreground' },
  pending_review: { bg: 'bg-warning/20', text: 'text-warning-foreground' },
  published: { bg: 'bg-success/20', text: 'text-success' },
  rejected: { bg: 'bg-destructive/20', text: 'text-destructive' },
  archived: { bg: 'bg-secondary', text: 'text-secondary-foreground' },
}

export interface Category {
  id: string
  name: string
  nameEn?: string
  slug: string
  description?: string
  parent?: Category | null
  order: number
  isActive: boolean
  postCount: number
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  nameEn?: string
  slug: string
  postCount: number
  createdAt: string
}

export interface Author {
  id: string
  username: string
  fullName: string
  avatar?: string
}

export interface ContentBase {
  id: string
  title: string
  titleEn?: string
  summary?: string
  summaryEn?: string
  slug: string
  excerpt?: string
  excerptEn?: string
  content: string
  contentEn?: string
  featuredImage?: string
  featuredImageAlt?: string
  status: ContentStatus
  author: Author
  categories: Category[]
  tags: Tag[]
  viewCount: number
  publishedAt?: string
  scheduledAt?: string
  isFeatured?: boolean
  isLive?: boolean
  readingTimeMinutes?: number
  createdAt: string
  updatedAt: string
  // SEO fields
  metaTitle?: string
  metaTitleEn?: string
  metaDescription?: string
  metaDescriptionEn?: string
  metaKeywords?: string[]
  canonicalUrl?: string
  // Workflow
  reviewedBy?: Author
  reviewedAt?: string
  rejectionReason?: string
}

// News/Post specific
export interface Post extends ContentBase {
  type: 'news'
  isBreaking?: boolean
  isFeatured?: boolean
  isLive?: boolean
  readingTimeMinutes?: number
  source?: string
  sourceUrl?: string
}

// Arsenal/Weapon specific
export interface Weapon extends ContentBase {
  type: 'arsenal'
  weaponCategory?: WeaponCategory
  categoryLabelFa?: string
  specifications?: Record<string, string>
  specificationsEn?: Record<string, string>
  specificationsTranslations?: Record<string, string>
  specificationsUnitTranslations?: Record<string, string>
  weaponType?: string
  weaponTypeEn?: string
  rangeKm?: number
  manufacturer?: string
  manufacturerEn?: string
  countryOfOrigin?: string
  countryOfOriginEn?: string
  yearIntroduced?: number
  isOperational?: boolean
}

export interface WeaponCategory {
  id: string
  name: string
  nameEn?: string
  slug: string
  description?: string
  icon?: string
  order: number
  weaponCount: number
}

// Martyrs specific
export interface Martyr extends ContentBase {
  type: 'martyrs'
  martyrCategory?: MartyrCategory
  martyrUnitId?: string
  birthDate?: string
  birthDateEn?: string
  martyrdomDate?: string
  martyrdomDateEn?: string
  birthPlace?: string
  birthPlaceEn?: string
  martyrdomPlace?: string
  martyrdomPlaceEn?: string
  rank?: string
  rankEn?: string
  unit?: string
  unitEn?: string
  biography?: string
  biographyEn?: string
}

export interface MartyrCategory {
  id: string
  name: string
  nameEn?: string
  slug: string
  description?: string
  icon?: string
  order: number
  martyrCount: number
}

// Documents specific
export interface Document extends ContentBase {
  type: 'documents'
  documentCategory?: DocumentCategory
  fileUrl?: string
  fileSize?: number
  fileType?: string
  downloadCount: number
  isConfidential?: boolean
  confidentialityLevel?: 'public' | 'internal' | 'confidential' | 'secret'
}

export interface DocumentCategory {
  id: string
  name: string
  nameEn?: string
  slug: string
  description?: string
  icon?: string
  order: number
  documentCount: number
}

// Achievements specific
export interface Achievement extends ContentBase {
  type: 'achievements'
  achievementCategory?: AchievementCategory
  verificationStatus?: 'pending' | 'verified' | 'rejected'
  targetType?: 'air' | 'ground' | 'sea' | 'cyber' | 'mixed'
  martyrId?: string
  regionFa?: string
  destroyedTargetsCount?: number
  strategicGainCount?: number
  achievementDate?: string
  achievementDateEn?: string
  location?: string
  locationEn?: string
  participants?: string[]
  participantsEn?: string[]
  awards?: string[]
  awardsEn?: string[]
  gallery?: string[]
}

export interface AchievementCategory {
  id: string
  name: string
  nameEn?: string
  slug: string
  description?: string
  icon?: string
  order: number
  achievementCount: number
}

// Union type for all content
export type ContentItem = Post | Weapon | Martyr | Document | Achievement

// Content type labels
export const CONTENT_TYPE_LABELS: Record<string, string> = {
  news: 'خبر',
  arsenal: 'تسلیحات',
  martyrs: 'شهید',
  documents: 'سند',
  achievements: 'دستاورد',
}

// Change log entry
export interface ChangeLogEntry {
  id: string
  action: 'create' | 'update' | 'status_change' | 'delete'
  actionLabel: string
  user: Author
  changes?: Record<string, { old: unknown; new: unknown }>
  comment?: string
  createdAt: string
}
