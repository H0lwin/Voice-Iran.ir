                    // API Client with Mock Data Support
import type {
  Post,
  Weapon,
  Martyr,
  Document,
  Achievement,
  User,
  Category,
  Tag,
  Notification,
  PublishSchedule,
  SeoConfig,
  RedirectRule,
  ApiClient,
  ApiKey,
  ApiRateLimit,
  PaginatedResponse,
  FilterParams,
  AnalyticsDashboard,
  SiteSettings,
  OrganizationProfile,
  LiveStat,
  Banner,
  StaticPage,
  LoginCredentials,
  LoginResponse,
  ContentStatus,
  AccessProfile,
  LanguageSetting,
} from '@/lib/types'
import { APP_LABELS } from '@/lib/types'

import {
  mockPosts,
  mockWeapons,
  mockMartyrs,
  mockDocuments,
  mockAchievements,
  mockUsers,
  mockRoles,
  mockAccessProfiles,
  mockCategories,
  mockTags,
  mockNotifications,
  mockPublishSchedules,
  mockSeoConfigs,
  mockRedirectRules,
  mockApiClients,
  mockAnalyticsDashboard,
  mockSiteSettings,
  mockOrganizationProfile,
  mockLiveStats,
  mockBanners,
  mockWeaponCategories,
  mockMartyrCategories,
  mockDocumentCategories,
  mockAchievementCategories,
  mockMartyrUnits,
  mockDocumentTypes,
  mockApiKeys,
  mockApiRateLimits,
  mockLanguages,
} from './mock-data'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Simulate API response with delay
async function simulateApi<T>(data: T, delayMs = 300): Promise<T> {
  await delay(delayMs)
  return data
}

// Paginate array
function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = items.slice(start, end)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  }
}

// Filter and sort array
function filterAndSort<T extends { title?: string; status?: string; createdAt: string }>(
  items: T[],
  filters: FilterParams
): T[] {
  let result = [...items]

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(item => 
      item.title?.toLowerCase().includes(searchLower)
    )
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    result = result.filter(item => item.status === filters.status)
  }

  // Sort
  if (filters.sortBy) {
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1
    result.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof T]
      const bValue = b[filters.sortBy as keyof T]
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * sortOrder
      }
      return 0
    })
  }

  return result
}

// Authentication API
export const authApi = {
  getCsrfToken: async (): Promise<{ csrfToken: string }> => {
    await delay(180)
    return { csrfToken: `csrf-${Date.now()}` }
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    await delay(500)
    
    // Simulate login validation
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return {
        user: mockUsers[0],
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    }
    
    if (credentials.username === 'manager' && credentials.password === 'manager123') {
      return {
        user: mockUsers[1],
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    }
    
    if (credentials.username === 'editor' && credentials.password === 'editor123') {
      return {
        user: mockUsers[2],
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    }
    
    throw new Error('نام کاربری یا رمز عبور اشتباه است')
  },
  
  logout: async (): Promise<void> => {
    await delay(200)
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    await delay(200)
    // In real app, this would validate the token
    return null
  },
}

// News/Posts API
export const postsApi = {
  getAll: async (filters: FilterParams = {}): Promise<PaginatedResponse<Post>> => {
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const filtered = filterAndSort(mockPosts, filters)
    return simulateApi(paginate(filtered, page, pageSize))
  },
  
  getById: async (id: string): Promise<Post | null> => {
    const post = mockPosts.find(p => p.id === id)
    return simulateApi(post || null)
  },

  checkSlugUnique: async (slug: string, excludeId?: string): Promise<boolean> => {
    const normalized = slug.trim().toLowerCase()
    if (!normalized) return simulateApi(false)
    const exists = mockPosts.some(
      (post) => post.slug.toLowerCase() === normalized && post.id !== excludeId,
    )
    return simulateApi(!exists, 180)
  },
  
  create: async (data: Partial<Post>): Promise<Post> => {
    const newPost: Post = {
      id: String(mockPosts.length + 1),
      type: 'news',
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      status: 'draft',
      author: mockUsers[0],
      categories: [],
      tags: [],
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as Post
    mockPosts.push(newPost)
    return simulateApi(newPost)
  },
  
  update: async (id: string, data: Partial<Post>): Promise<Post> => {
    const index = mockPosts.findIndex(p => p.id === id)
    if (index === -1) throw new Error('مطلب یافت نشد')
    mockPosts[index] = { ...mockPosts[index], ...data, updatedAt: new Date().toISOString() }
    return simulateApi(mockPosts[index])
  },
  
  delete: async (id: string): Promise<void> => {
    const index = mockPosts.findIndex(p => p.id === id)
    if (index === -1) throw new Error('مطلب یافت نشد')
    mockPosts.splice(index, 1)
    return simulateApi(undefined)
  },
  
  updateStatus: async (id: string, status: ContentStatus, reason?: string): Promise<Post> => {
    const index = mockPosts.findIndex(p => p.id === id)
    if (index === -1) throw new Error('مطلب یافت نشد')
    mockPosts[index] = {
      ...mockPosts[index],
      status,
      rejectionReason: status === 'rejected' ? reason : undefined,
      publishedAt: status === 'published' ? new Date().toISOString() : mockPosts[index].publishedAt,
      updatedAt: new Date().toISOString(),
    }
    return simulateApi(mockPosts[index])
  },
}

// Weapons API
export const weaponsApi = {
  getAll: async (filters: FilterParams = {}): Promise<PaginatedResponse<Weapon>> => {
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const filtered = filterAndSort(mockWeapons, filters)
    return simulateApi(paginate(filtered, page, pageSize))
  },
  
  getById: async (id: string): Promise<Weapon | null> => {
    const weapon = mockWeapons.find(w => w.id === id)
    return simulateApi(weapon || null)
  },
  
  getCategories: async (): Promise<typeof mockWeaponCategories> => {
    return simulateApi(mockWeaponCategories)
  },

  create: async (data: Partial<Weapon>): Promise<Weapon> => {
    const newItem: Weapon = {
      id: String(mockWeapons.length + 1),
      type: 'arsenal',
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      status: 'draft',
      author: mockUsers[0],
      categories: [],
      tags: [],
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as Weapon
    mockWeapons.push(newItem)
    return simulateApi(newItem)
  },

  update: async (id: string, data: Partial<Weapon>): Promise<Weapon> => {
    const index = mockWeapons.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('رکورد یافت نشد')
    mockWeapons[index] = { ...mockWeapons[index], ...data, updatedAt: new Date().toISOString() }
    return simulateApi(mockWeapons[index])
  },

  updateStatus: async (id: string, status: ContentStatus): Promise<Weapon> => {
    const index = mockWeapons.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('رکورد یافت نشد')
    mockWeapons[index] = {
      ...mockWeapons[index],
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : mockWeapons[index].publishedAt,
      updatedAt: new Date().toISOString(),
    }
    return simulateApi(mockWeapons[index])
  },
}

// Martyrs API
export const martyrsApi = {
  getAll: async (filters: FilterParams = {}): Promise<PaginatedResponse<Martyr>> => {
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const filtered = filterAndSort(mockMartyrs, filters)
    return simulateApi(paginate(filtered, page, pageSize))
  },
  
  getById: async (id: string): Promise<Martyr | null> => {
    const martyr = mockMartyrs.find(m => m.id === id)
    return simulateApi(martyr || null)
  },
  
  getCategories: async (): Promise<typeof mockMartyrCategories> => {
    return simulateApi(mockMartyrCategories)
  },

  getUnits: async (): Promise<typeof mockMartyrUnits> => {
    return simulateApi(mockMartyrUnits)
  },

  create: async (data: Partial<Martyr>): Promise<Martyr> => {
    const newItem: Martyr = {
      id: String(mockMartyrs.length + 1),
      type: 'martyrs',
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      status: 'draft',
      author: mockUsers[0],
      categories: [],
      tags: [],
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as Martyr
    mockMartyrs.push(newItem)
    return simulateApi(newItem)
  },

  update: async (id: string, data: Partial<Martyr>): Promise<Martyr> => {
    const index = mockMartyrs.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('رکورد یافت نشد')
    mockMartyrs[index] = { ...mockMartyrs[index], ...data, updatedAt: new Date().toISOString() }
    return simulateApi(mockMartyrs[index])
  },

  updateStatus: async (id: string, status: ContentStatus): Promise<Martyr> => {
    const index = mockMartyrs.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('رکورد یافت نشد')
    mockMartyrs[index] = {
      ...mockMartyrs[index],
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : mockMartyrs[index].publishedAt,
      updatedAt: new Date().toISOString(),
    }
    return simulateApi(mockMartyrs[index])
  },
}

// Documents API
export const documentsApi = {
  getAll: async (filters: FilterParams = {}): Promise<PaginatedResponse<Document>> => {
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const filtered = filterAndSort(mockDocuments, filters)
    return simulateApi(paginate(filtered, page, pageSize))
  },
  
  getById: async (id: string): Promise<Document | null> => {
    const doc = mockDocuments.find(d => d.id === id)
    return simulateApi(doc || null)
  },
  
  getCategories: async (): Promise<typeof mockDocumentCategories> => {
    return simulateApi(mockDocumentCategories)
  },

  getDocumentTypes: async (): Promise<typeof mockDocumentTypes> => {
    return simulateApi(mockDocumentTypes)
  },

  create: async (data: Partial<Document>): Promise<Document> => {
    const newItem: Document = {
      id: String(mockDocuments.length + 1),
      type: 'documents',
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      status: 'draft',
      author: mockUsers[0],
      categories: [],
      tags: [],
      viewCount: 0,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as Document
    mockDocuments.push(newItem)
    return simulateApi(newItem)
  },

  update: async (id: string, data: Partial<Document>): Promise<Document> => {
    const index = mockDocuments.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('رکورد یافت نشد')
    mockDocuments[index] = { ...mockDocuments[index], ...data, updatedAt: new Date().toISOString() }
    return simulateApi(mockDocuments[index])
  },

  updateStatus: async (id: string, status: ContentStatus): Promise<Document> => {
    const index = mockDocuments.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('رکورد یافت نشد')
    mockDocuments[index] = {
      ...mockDocuments[index],
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : mockDocuments[index].publishedAt,
      updatedAt: new Date().toISOString(),
    }
    return simulateApi(mockDocuments[index])
  },
}

// Achievements API
export const achievementsApi = {
  getAll: async (filters: FilterParams = {}): Promise<PaginatedResponse<Achievement>> => {
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const filtered = filterAndSort(mockAchievements, filters)
    return simulateApi(paginate(filtered, page, pageSize))
  },
  
  getById: async (id: string): Promise<Achievement | null> => {
    const achievement = mockAchievements.find(a => a.id === id)
    return simulateApi(achievement || null)
  },
  
  getCategories: async (): Promise<typeof mockAchievementCategories> => {
    return simulateApi(mockAchievementCategories)
  },

  create: async (data: Partial<Achievement>): Promise<Achievement> => {
    const newItem: Achievement = {
      id: String(mockAchievements.length + 1),
      type: 'achievements',
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      status: 'draft',
      author: mockUsers[0],
      categories: [],
      tags: [],
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as Achievement
    mockAchievements.push(newItem)
    return simulateApi(newItem)
  },

  update: async (id: string, data: Partial<Achievement>): Promise<Achievement> => {
    const index = mockAchievements.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('رکورد یافت نشد')
    mockAchievements[index] = { ...mockAchievements[index], ...data, updatedAt: new Date().toISOString() }
    return simulateApi(mockAchievements[index])
  },

  updateStatus: async (id: string, status: ContentStatus): Promise<Achievement> => {
    const index = mockAchievements.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('رکورد یافت نشد')
    mockAchievements[index] = {
      ...mockAchievements[index],
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : mockAchievements[index].publishedAt,
      updatedAt: new Date().toISOString(),
    }
    return simulateApi(mockAchievements[index])
  },
}

// Users API
export const usersApi = {
  getAll: async (filters: FilterParams = {}): Promise<PaginatedResponse<User>> => {
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    let list = [...mockUsers]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    }
    return simulateApi(paginate(list, page, pageSize))
  },
  
  getById: async (id: string): Promise<User | null> => {
    const user = mockUsers.find(u => u.id === id)
    return simulateApi(user || null)
  },
  
  getRoles: async () => {
    return simulateApi(mockRoles)
  },
}

export const profilesApi = {
  getAll: async (): Promise<AccessProfile[]> => {
    return simulateApi(mockAccessProfiles)
  },
  getAppList: async (): Promise<{ id: string; label: string }[]> => {
    const apps = Object.entries(APP_LABELS).map(([id, label]) => ({ id, label }))
    return simulateApi(apps)
  },
}

const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
const IMAGE_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

export const mediaApi = {
  /** شبیه‌سازی آپلود؛ خروجی برای ذخیره در محتوا به صورت تگ img با همین src استفاده می‌شود. */
  uploadImage: async (file: File): Promise<string> => {
    await delay(250)
    if (!IMAGE_UPLOAD_TYPES.includes(file.type as (typeof IMAGE_UPLOAD_TYPES)[number])) {
      throw new Error('فقط تصویر JPG، PNG، WebP یا GIF مجاز است')
    }
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      throw new Error('حداکثر حجم فایل ۵ مگابایت است')
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود'))
      reader.readAsDataURL(file)
    })
  },
}

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return simulateApi(mockCategories)
  },
  
  create: async (data: Partial<Category>): Promise<Category> => {
    const newCategory: Category = {
      id: String(mockCategories.length + 1),
      name: data.name || '',
      slug: data.slug || '',
      order: mockCategories.length + 1,
      isActive: true,
      postCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as Category
    mockCategories.push(newCategory)
    return simulateApi(newCategory)
  },
}

// Tags API
export const tagsApi = {
  getAll: async (): Promise<Tag[]> => {
    return simulateApi(mockTags)
  },
  
  create: async (data: Partial<Tag>): Promise<Tag> => {
    const newTag: Tag = {
      id: String(mockTags.length + 1),
      name: data.name || '',
      slug: data.slug || '',
      postCount: 0,
      createdAt: new Date().toISOString(),
      ...data,
    } as Tag
    mockTags.push(newTag)
    return simulateApi(newTag)
  },
}

// Notifications API
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    return simulateApi(mockNotifications)
  },
  
  getUnreadCount: async (): Promise<number> => {
    const count = mockNotifications.filter(n => !n.isRead).length
    return simulateApi(count)
  },
  
  markAsRead: async (id: string): Promise<void> => {
    const notification = mockNotifications.find(n => n.id === id)
    if (notification) {
      notification.isRead = true
      notification.readAt = new Date().toISOString()
    }
    return simulateApi(undefined)
  },
  
  markAllAsRead: async (): Promise<void> => {
    mockNotifications.forEach(n => {
      n.isRead = true
      n.readAt = new Date().toISOString()
    })
    return simulateApi(undefined)
  },
}

// Publishing API
export const publishingApi = {
  getSchedules: async (): Promise<PublishSchedule[]> => {
    return simulateApi(mockPublishSchedules)
  },
  
  createSchedule: async (data: Partial<PublishSchedule>): Promise<PublishSchedule> => {
    const newSchedule: PublishSchedule = {
      id: String(mockPublishSchedules.length + 1),
      contentType: data.contentType || 'news',
      contentId: data.contentId || '',
      contentTitle: data.contentTitle || '',
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      action: data.action || 'publish',
      status: 'pending',
      createdBy: 'محمد احمدی',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockPublishSchedules.push(newSchedule)
    return simulateApi(newSchedule)
  },
  
  cancelSchedule: async (id: string): Promise<void> => {
    const schedule = mockPublishSchedules.find(s => s.id === id)
    if (schedule) {
      schedule.status = 'cancelled'
    }
    return simulateApi(undefined)
  },
}

// SEO API
export const seoApi = {
  getConfigs: async (): Promise<SeoConfig[]> => {
    return simulateApi(mockSeoConfigs)
  },
  
  getRedirects: async (): Promise<RedirectRule[]> => {
    return simulateApi(mockRedirectRules)
  },
}

// API Management
export const apiManagementApi = {
  getClients: async (): Promise<ApiClient[]> => {
    return simulateApi(mockApiClients)
  },

  getKeys: async (): Promise<ApiKey[]> => {
    return simulateApi(
      mockApiKeys.map((row) => ({
        id: row.id,
        client: mockApiClients.find((client) => client.id === row.clientId)!,
        key: '',
        keyPrefix: row.keyPrefix,
        name: `Key-${row.keyPrefix}`,
        permissions: ['read', 'write'],
        expiresAt: row.expiresAt,
        isActive: row.isActive,
        lastUsedAt: row.lastUsedAt,
        requestCount: 0,
        createdAt: '2026-01-01T00:00:00Z',
      })),
    )
  },

  createKey: async (clientId: string, expiresAt?: string) => {
    const fullKey = `vra_${Math.random().toString(36).slice(2)}_${Date.now()}`
    const keyPrefix = fullKey.slice(0, 8)
    mockApiKeys.unshift({
      id: crypto.randomUUID(),
      clientId,
      keyPrefix,
      isActive: true,
      expiresAt: expiresAt ?? '2027-12-31T23:59:59Z',
      lastUsedAt: new Date().toISOString(),
    })
    return simulateApi({ fullKey, keyPrefix })
  },

  getRateLimits: async (): Promise<ApiRateLimit[]> => {
    return simulateApi(mockApiRateLimits)
  },
}

// Analytics API
export const analyticsApi = {
  getDashboard: async (
    period: 'today' | 'week' | 'month' | 'year' = 'month',
    options?: { days?: 7 | 30 | 90; language?: string; sourceType?: string; from?: string; to?: string },
  ): Promise<AnalyticsDashboard> => {
    const days = options?.days ?? 30
    return simulateApi({
      ...mockAnalyticsDashboard,
      period,
      visitStats: mockAnalyticsDashboard.visitStats.slice(-days),
      popularContent: mockAnalyticsDashboard.popularContent,
    })
  },
}

// Settings API
export const settingsApi = {
  getSiteSettings: async (): Promise<SiteSettings> => {
    return simulateApi(mockSiteSettings)
  },
  
  updateSiteSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    Object.assign(mockSiteSettings, data, { updatedAt: new Date().toISOString() })
    return simulateApi(mockSiteSettings)
  },
  
  getOrganizationProfile: async (): Promise<OrganizationProfile> => {
    return simulateApi(mockOrganizationProfile)
  },
  
  getLiveStats: async (): Promise<LiveStat[]> => {
    return simulateApi(mockLiveStats)
  },
  
  getBanners: async (): Promise<Banner[]> => {
    return simulateApi(mockBanners)
  },
}

export const localizationApi = {
  getLanguages: async (): Promise<LanguageSetting[]> => simulateApi(mockLanguages),
  saveLanguage: async (payload: Partial<LanguageSetting> & { id?: string }): Promise<LanguageSetting> => {
    const existing = payload.id ? mockLanguages.find((item) => item.id === payload.id) : undefined
    if (payload.isDefault) {
      mockLanguages.forEach((item) => {
        item.isDefault = false
      })
    }
    if (existing) {
      Object.assign(existing, payload)
      return simulateApi(existing)
    }
    const created: LanguageSetting = {
      id: crypto.randomUUID(),
      code: payload.code || '',
      name: payload.name || '',
      isDefault: Boolean(payload.isDefault),
      isActive: payload.isActive ?? true,
      direction: payload.direction || 'rtl',
      calendarSystem: payload.calendarSystem || 'jalali',
      dateFormat: payload.dateFormat || 'YYYY/MM/DD',
      numberFormat: payload.numberFormat || 'fa-IR',
      fallbackLanguage: payload.fallbackLanguage,
    }
    mockLanguages.unshift(created)
    return simulateApi(created)
  },
}

// Dashboard Stats
export const dashboardApi = {
  getStats: async () => {
    return simulateApi({
      totalPosts: mockPosts.length,
      publishedPosts: mockPosts.filter(p => p.status === 'published').length,
      pendingReview: mockPosts.filter(p => p.status === 'pending_review').length,
      draftPosts: mockPosts.filter(p => p.status === 'draft').length,
      totalWeapons: mockWeapons.length,
      totalMartyrs: mockMartyrs.length,
      totalDocuments: mockDocuments.length,
      totalAchievements: mockAchievements.length,
      totalUsers: mockUsers.length,
      recentActivity: mockNotifications.slice(0, 5),
    })
  },
}
