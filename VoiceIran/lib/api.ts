import {routing, type AppLocale} from '@/i18n/routing'

const API_BASE_URL =
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

type JsonRecord = Record<string, unknown>

type FetchOptions = {
  locale: AppLocale
  endpoint: string
  revalidate?: number
  fallbackToDefault?: boolean
}

function withLocale(endpoint: string, locale: AppLocale): string {
  const separator = endpoint.includes('?') ? '&' : '?'
  return `${API_BASE_URL}${endpoint}${separator}lang=${locale}`
}

async function requestJson<T>(url: string, revalidate: number): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    next: {revalidate: 0},
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed fetch: ${response.status} ${url}`)
  }

  return (await response.json()) as T
}

export async function fetchLocaleContent<T extends JsonRecord | JsonRecord[]>({
  locale,
  endpoint,
  revalidate = 0,
  fallbackToDefault = true,
}: FetchOptions): Promise<T> {
  try {
    return await requestJson<T>(withLocale(endpoint, locale), revalidate)
  } catch {
    if (fallbackToDefault && locale !== routing.defaultLocale) {
      return requestJson<T>(withLocale(endpoint, routing.defaultLocale), revalidate)
    }
    throw new Error(`Content unavailable for endpoint: ${endpoint}`)
  }
}

export type Post = {
  id: string | number
  slug?: string
  title: string
  excerpt?: string
  summary?: string
  image?: string
  published_at?: string
  category_label?: string
  category_slug?: string
  reading_time?: number
  views?: number
  is_live?: boolean
  is_featured?: boolean
  is_bookmarked?: boolean
  content?: string
  categories?: Array<{slug: string; label: string}>
  tags?: Array<{slug: string; label: string}>
}

export type Weapon = {
  id: string | number
  slug?: string
  name: string
  name_en?: string
  published_at?: string
  category?: string
  category_slug?: string
  type?: string
  range?: number
  image?: string
  features?: string[]
  specs?: Array<{key: string; value: string; unit?: string}>
  status_label?: string
  year?: number
  description?: string
}

export type AchievementItem = {
  id: string | number
  slug?: string
  title: string
  excerpt?: string
  summary?: string
  content?: string
  image?: string
  region?: string
  target_type?: string
  target_type_label?: string
  verification_status?: string
  verification_status_label?: string
  destroyed_targets_count?: number
  strategic_gain_count?: number
  is_featured?: boolean
  published_at?: string
  view_count?: number
}

export type Martyr = {
  id: string | number
  slug?: string
  name: string
  title?: string
  /** Military / honorific rank (mock: درجه); distinct from role title under name */
  rank?: string
  birth_date?: string
  image?: string
  martyrdom_date?: string
  martyrdom_location?: string
  unit_label?: string
  unit_slug?: string
  biography?: string
  short_bio?: string
  achievements?: string[]
  is_featured?: boolean
}

export type DocumentItem = {
  id: string | number
  slug?: string
  title: string
  description?: string
  summary?: string
  type?: string
  type_label?: string
  thumbnail?: string
  published_at?: string
  view_count?: number
  download_count?: number
  duration_seconds?: number
  page_count?: number
  item_count?: number
  primary_file_url?: string
  is_featured?: boolean
}

export type UnifiedSearchResult = {
  id: string | number
  type: 'posts' | 'weapons' | 'martyrs' | 'documents' | string
  title: string
  category?: string
  image?: string
}

export type HomePagePayload = {
  hero: {
    live_badge: string
    title: string
    description: string
    primary_action_label: string
    secondary_action_label: string
    background_image?: string
  }
  quick_access: {
    items: Array<{
      key: 'news' | 'arsenal' | 'martyrs' | 'documents' | string
      href: string
      label: string
      count: number
      description: string
    }>
  }
  live_stats: {
    title: string
    items: Array<{key: string; label: string; value: number}>
  }
  common: {
    empty_label: string
  }
  sections: {
    latest_news: {title: string; view_all_label: string; items: (Post & {category?: string; is_live?: boolean})[]}
    latest_achievements: {title: string; view_all_label: string; items: AchievementItem[]}
    featured_weapons: {title: string; view_all_label: string; item: (Weapon & {features?: string[]}) | null}
    featured_documents: {title: string; view_all_label: string; items: DocumentItem[]}
    featured_martyrs: {title: string; view_all_label: string; quote: string; items: Martyr[]}
  }
}

export type NewsOverviewPayload = {
  filters: {categories: Array<{id: string; label: string; count: number}>}
  trending_terms: string[]
  featured: Post | null
  items: Post[]
}

export type ArsenalOverviewPayload = {
  filters: {categories: Array<{id: string; label: string; count: number}>}
  stats: {total: number; operational: number; max_range: number}
  items: Weapon[]
}

export type MartyrsOverviewPayload = {
  filters: {units: Array<{id: string; label: string; count: number}>}
  featured: Martyr[]
  items: Martyr[]
}

export type DocumentsOverviewPayload = {
  filters: {types: Array<{id: string; label: string; count: number}>}
  featured: DocumentItem[]
  items: DocumentItem[]
  timeline: Array<{year: number; title: string; description: string}>
}

export type SearchMetaPayload = {
  popular_terms: string[]
}

export async function getHomePageData(locale: AppLocale): Promise<HomePagePayload | null> {
  try {
    return await fetchLocaleContent<HomePagePayload>({
      locale,
      endpoint: '/homepage/',
    })
  } catch {
    return null
  }
}

export async function searchUnified(
  locale: AppLocale,
  query: string,
  limit = 20,
): Promise<UnifiedSearchResult[]> {
  if (!query.trim()) return []
  const safeLimit = Math.max(1, Math.min(limit, 50))
  const endpoint = `/search/?q=${encodeURIComponent(query.trim())}&limit=${safeLimit}`
  const url = withLocale(endpoint, locale)
  try {
    const response = await fetch(url, {
      headers: {Accept: 'application/json'},
      cache: 'no-store',
    })
    if (!response.ok) return []
    const data = (await response.json()) as {results?: UnifiedSearchResult[]}
    return data.results || []
  } catch {
    return []
  }
}

export async function getPosts(locale: AppLocale): Promise<Post[]> {
  try {
    const data = await fetchLocaleContent<{results?: Post[]} | Post[]>({
      locale,
      endpoint: '/posts',
    })
    return Array.isArray(data) ? data : data.results || []
  } catch {
    return []
  }
}

export async function getNewsOverview(
  locale: AppLocale,
  params?: {q?: string; category?: string},
): Promise<NewsOverviewPayload | null> {
  const query = new URLSearchParams()
  if (params?.q?.trim()) query.set('q', params.q.trim())
  if (params?.category?.trim()) query.set('category', params.category.trim())
  const endpoint = `/news/overview/${query.toString() ? `?${query.toString()}` : ''}`
  try {
    return await fetchLocaleContent<NewsOverviewPayload>({locale, endpoint})
  } catch {
    return null
  }
}

export async function getWeapons(locale: AppLocale): Promise<Weapon[]> {
  try {
    const data = await fetchLocaleContent<{results?: Weapon[]} | Weapon[]>({
      locale,
      endpoint: '/weapons',
    })
    return Array.isArray(data) ? data : data.results || []
  } catch {
    return []
  }
}

export async function getArsenalOverview(
  locale: AppLocale,
  params?: {category?: string},
): Promise<ArsenalOverviewPayload | null> {
  const query = new URLSearchParams()
  if (params?.category?.trim()) query.set('category', params.category.trim())
  const endpoint = `/arsenal/overview/${query.toString() ? `?${query.toString()}` : ''}`
  try {
    return await fetchLocaleContent<ArsenalOverviewPayload>({locale, endpoint})
  } catch {
    return null
  }
}

export async function getMartyrs(locale: AppLocale): Promise<Martyr[]> {
  try {
    const data = await fetchLocaleContent<{results?: Martyr[]} | Martyr[]>({
      locale,
      endpoint: '/martyrs',
    })
    return Array.isArray(data) ? data : data.results || []
  } catch {
    return []
  }
}

export async function getMartyrsOverview(
  locale: AppLocale,
  params?: {unit?: string},
): Promise<MartyrsOverviewPayload | null> {
  const query = new URLSearchParams()
  if (params?.unit?.trim()) query.set('unit', params.unit.trim())
  const endpoint = `/martyrs/overview/${query.toString() ? `?${query.toString()}` : ''}`
  try {
    return await fetchLocaleContent<MartyrsOverviewPayload>({locale, endpoint})
  } catch {
    return null
  }
}

export async function getDocuments(locale: AppLocale): Promise<DocumentItem[]> {
  try {
    const data = await fetchLocaleContent<{results?: DocumentItem[]} | DocumentItem[]>({
      locale,
      endpoint: '/documents',
    })
    return Array.isArray(data) ? data : data.results || []
  } catch {
    return []
  }
}

export async function getDocumentsOverview(
  locale: AppLocale,
  params?: {type?: string},
): Promise<DocumentsOverviewPayload | null> {
  const query = new URLSearchParams()
  if (params?.type?.trim()) query.set('type', params.type.trim())
  const endpoint = `/documents/overview/${query.toString() ? `?${query.toString()}` : ''}`
  try {
    return await fetchLocaleContent<DocumentsOverviewPayload>({locale, endpoint})
  } catch {
    return null
  }
}

export async function getSearchMeta(locale: AppLocale): Promise<SearchMetaPayload> {
  try {
    return await fetchLocaleContent<SearchMetaPayload>({locale, endpoint: '/search/meta/'})
  } catch {
    return {popular_terms: []}
  }
}

export async function getAchievements(locale: AppLocale): Promise<AchievementItem[]> {
  try {
    const data = await fetchLocaleContent<{results?: AchievementItem[]} | AchievementItem[]>({
      locale,
      endpoint: '/achievements',
    })
    return Array.isArray(data) ? data : data.results || []
  } catch {
    return []
  }
}

async function getBySlugOrId<T extends {id: string | number}>(
  locale: AppLocale,
  baseEndpoint: '/posts' | '/weapons' | '/martyrs' | '/documents' | '/achievements',
  slugOrId: string,
): Promise<T | null> {
  const normalized = slugOrId.trim()
  if (!normalized) return null

  const isNumericId = /^\d+$/.test(normalized)
  if (isNumericId) {
    try {
      return await fetchLocaleContent<T>({
        locale,
        endpoint: `${baseEndpoint}/${normalized}/`,
      })
    } catch {
      // fall through to slug query
    }
  }

  try {
    const data = await fetchLocaleContent<{results?: T[]}>({
      locale,
      endpoint: `${baseEndpoint}/?slug=${encodeURIComponent(normalized)}&page_size=1`,
    })
    return data.results?.[0] || null
  } catch {
    return null
  }
}

export async function getPostDetail(locale: AppLocale, slugOrId: string): Promise<Post | null> {
  return getBySlugOrId<Post>(locale, '/posts', slugOrId)
}

export async function getWeaponDetail(locale: AppLocale, slugOrId: string): Promise<Weapon | null> {
  return getBySlugOrId<Weapon>(locale, '/weapons', slugOrId)
}

export async function getMartyrDetail(locale: AppLocale, slugOrId: string): Promise<Martyr | null> {
  return getBySlugOrId<Martyr>(locale, '/martyrs', slugOrId)
}

export async function getDocumentDetail(locale: AppLocale, slugOrId: string): Promise<DocumentItem | null> {
  return getBySlugOrId<DocumentItem>(locale, '/documents', slugOrId)
}

export async function getAchievementDetail(locale: AppLocale, slugOrId: string): Promise<AchievementItem | null> {
  return getBySlugOrId<AchievementItem>(locale, '/achievements', slugOrId)
}
