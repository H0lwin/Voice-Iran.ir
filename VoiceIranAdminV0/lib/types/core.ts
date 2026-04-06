// Core System Types

export interface SiteSettings {
  id: string
  siteName: string
  siteNameEn?: string
  siteDescription?: string
  siteDescriptionEn?: string
  logo?: string
  logoDark?: string
  favicon?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  socialLinks?: SocialLinks
  footerText?: string
  footerTextEn?: string
  maintenanceMode: boolean
  maintenanceMessage?: string
  analyticsId?: string
  updatedAt: string
}

export interface SocialLinks {
  twitter?: string
  telegram?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  aparat?: string
}

export interface OrganizationProfile {
  id: string
  name: string
  nameEn?: string
  description?: string
  descriptionEn?: string
  mission?: string
  missionEn?: string
  vision?: string
  visionEn?: string
  history?: string
  historyEn?: string
  logo?: string
  foundedDate?: string
  leaderName?: string
  leaderTitle?: string
  leaderImage?: string
  headquarters?: string
  updatedAt: string
}

export interface LiveStat {
  id: string
  label: string
  labelEn?: string
  value: number
  displayValue: string // formatted with Persian numerals
  icon?: string
  order: number
  isActive: boolean
  updatedAt: string
}

export interface Banner {
  id: string
  title: string
  titleEn?: string
  subtitle?: string
  subtitleEn?: string
  image: string
  imageMobile?: string
  link?: string
  linkText?: string
  linkTextEn?: string
  position: 'hero' | 'sidebar' | 'footer' | 'popup'
  order: number
  isActive: boolean
  startDate?: string
  endDate?: string
  viewCount: number
  clickCount: number
  createdAt: string
  updatedAt: string
}

export interface StaticPage {
  id: string
  title: string
  titleEn?: string
  slug: string
  content: string
  contentEn?: string
  metaTitle?: string
  metaDescription?: string
  isActive: boolean
  showInMenu: boolean
  menuOrder?: number
  template?: 'default' | 'full-width' | 'sidebar'
  createdAt: string
  updatedAt: string
}

// Taxonomy Types
export interface Vocabulary {
  id: string
  name: string
  nameEn?: string
  machineName: string
  description?: string
  isHierarchical: boolean
  termCount: number
  createdAt: string
  updatedAt: string
}

export interface Term {
  id: string
  vocabulary: Vocabulary
  name: string
  nameEn?: string
  slug: string
  description?: string
  parent?: Term | null
  order: number
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

// SEO Types
export interface SeoConfig {
  id: string
  path: string // URL path pattern
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
  canonicalUrl?: string
  robots?: string
  structuredData?: Record<string, unknown>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RedirectRule {
  id: string
  sourcePath: string
  targetPath: string
  redirectType: 301 | 302 | 307 | 308
  isActive: boolean
  hitCount: number
  createdAt: string
  updatedAt: string
}

// Publishing Types
export interface PublishSchedule {
  id: string
  contentType: string
  contentId: string
  contentTitle: string
  scheduledAt: string
  action: 'publish' | 'unpublish' | 'archive'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  executedAt?: string
  error?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  title: string
  message: string
  link?: string
  linkText?: string
  isRead: boolean
  userId: string
  createdAt: string
  readAt?: string
}

export interface NotificationTemplate {
  id: string
  name: string
  slug: string
  subject: string
  body: string
  variables: string[] // Available template variables
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// API Types
export interface ApiClient {
  id: string
  name: string
  description?: string
  clientId: string
  clientType?: 'first_party' | 'partner' | 'public'
  isActive: boolean
  rateLimit?: number
  rateLimitPeriod?: 'minute' | 'hour' | 'day'
  allowedOrigins?: string[]
  allowedIps?: string[]
  owners?: string[]
  lastUsedAt?: string
  requestCount: number
  createdAt: string
  updatedAt: string
}

export interface ApiKey {
  id: string
  client: ApiClient
  key: string // Only shown once on creation
  keyPrefix: string // First 8 chars for identification
  name: string
  permissions: string[]
  expiresAt?: string
  isActive: boolean
  lastUsedAt?: string
  requestCount: number
  createdAt: string
}

export interface ApiRateLimit {
  id: string
  scope: string
  limitPerMinute: number
  limitPerDay: number
  burstLimit: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Analytics Types
export interface VisitStats {
  date: string
  pageViews: number
  uniqueVisitors: number
  avgSessionDuration: number // in seconds
  bounceRate: number // percentage
}

export interface ContentStats {
  contentType: string
  contentTypeLabel: string
  count: number
  viewCount: number
  percentage: number
}

export interface PopularContent {
  id: string
  title: string
  contentType: string
  viewCount: number
  uniqueViews: number
  avgReadTime: number // in seconds
  publishedAt: string
}

export interface AnalyticsDashboard {
  period: 'today' | 'week' | 'month' | 'year'
  totalPageViews: number
  totalUniqueVisitors: number
  totalContentItems: number
  publishedToday: number
  pendingReview: number
  visitStats: VisitStats[]
  contentDistribution: ContentStats[]
  popularContent: PopularContent[]
  topReferrers: { source: string; visits: number }[]
  deviceBreakdown: { device: string; percentage: number }[]
  topCountries?: { country: string; flag: string; percentage: number }[]
}

export interface LanguageSetting {
  id: string
  code: string
  name: string
  isDefault: boolean
  isActive: boolean
  direction: 'rtl' | 'ltr'
  calendarSystem: 'jalali' | 'gregorian'
  dateFormat: string
  numberFormat: string
  fallbackLanguage?: string
}
