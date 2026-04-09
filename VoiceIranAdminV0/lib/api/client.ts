// Real API Client for Django Backend
import type {
  User,
  LoginCredentials,
  LoginResponse,
  Post,
  Weapon,
  Martyr,
  Document,
  Achievement,
  PaginatedResponse,
  FilterParams,
  ContentStatus,
  Category,
  Tag,
} from '@/lib/types'

const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1')
  : 'http://localhost:8000/api/v1'

interface ApiError {
  error?: string
  detail?: string
  message?: string
}

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // For session-based auth
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.detail || errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth API
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/admin/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    this.setToken(response.token)
    return response
  }

  async logout(): Promise<void> {
    await this.request('/admin/auth/logout/', { method: 'POST' })
    this.setToken(null)
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.request<User>('/admin/auth/me/')
    } catch {
      return null
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access: string; expiresAt: string }> {
    return this.request('/admin/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    })
  }

  // Dashboard API
  async getDashboardStats() {
    return this.request<{
      totalPosts: number
      publishedPosts: number
      pendingReview: number
      draftPosts: number
      totalMartyrs: number
      publishedMartyrs: number
      pendingMartyrs: number
      totalWeapons: number
      publishedWeapons: number
      pendingWeapons: number
      totalDocuments: number
      publishedDocuments: number
      pendingDocuments: number
      totalAchievements: number
      verifiedAchievements: number
      pendingAchievements: number
      totalUsers: number
    }>('/admin/dashboard/')
  }

  // Posts API
  async getPosts(filters: FilterParams = {}): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('page_size', String(filters.pageSize))
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)

    return this.request<PaginatedResponse<Post>>(`/admin/posts/?${params.toString()}`)
  }

  async getPost(id: number): Promise<Post> {
    return this.request<Post>(`/admin/posts/${id}/`)
  }

  async createPost(data: Partial<Post>): Promise<Post> {
    return this.request<Post>('/admin/posts/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePost(id: number, data: Partial<Post>): Promise<Post> {
    return this.request<Post>(`/admin/posts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deletePost(id: number): Promise<void> {
    await this.request(`/admin/posts/${id}/`, { method: 'DELETE' })
  }

  async publishPost(id: number): Promise<Post> {
    return this.request<Post>(`/admin/posts/${id}/publish/`, { method: 'POST' })
  }

  async rejectPost(id: number, reason?: string): Promise<Post> {
    return this.request<Post>(`/admin/posts/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Martyrs API
  async getMartyrs(filters: FilterParams = {}): Promise<PaginatedResponse<Martyr>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('page_size', String(filters.pageSize))
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)

    return this.request<PaginatedResponse<Martyr>>(`/admin/martyrs/?${params.toString()}`)
  }

  async getMartyr(id: number): Promise<Martyr> {
    return this.request<Martyr>(`/admin/martyrs/${id}/`)
  }

  async createMartyr(data: Partial<Martyr>): Promise<Martyr> {
    return this.request<Martyr>('/admin/martyrs/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMartyr(id: number, data: Partial<Martyr>): Promise<Martyr> {
    return this.request<Martyr>(`/admin/martyrs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteMartyr(id: number): Promise<void> {
    await this.request(`/admin/martyrs/${id}/`, { method: 'DELETE' })
  }

  // Weapons API
  async getWeapons(filters: FilterParams = {}): Promise<PaginatedResponse<Weapon>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('page_size', String(filters.pageSize))
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)

    return this.request<PaginatedResponse<Weapon>>(`/admin/weapons/?${params.toString()}`)
  }

  async getWeapon(id: number): Promise<Weapon> {
    return this.request<Weapon>(`/admin/weapons/${id}/`)
  }

  async createWeapon(data: Partial<Weapon>): Promise<Weapon> {
    return this.request<Weapon>('/admin/weapons/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateWeapon(id: number, data: Partial<Weapon>): Promise<Weapon> {
    return this.request<Weapon>(`/admin/weapons/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteWeapon(id: number): Promise<void> {
    await this.request(`/admin/weapons/${id}/`, { method: 'DELETE' })
  }

  // Documents API
  async getDocuments(filters: FilterParams = {}): Promise<PaginatedResponse<Document>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('page_size', String(filters.pageSize))
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)

    return this.request<PaginatedResponse<Document>>(`/admin/documents/?${params.toString()}`)
  }

  async getDocument(id: number): Promise<Document> {
    return this.request<Document>(`/admin/documents/${id}/`)
  }

  async createDocument(data: Partial<Document>): Promise<Document> {
    return this.request<Document>('/admin/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDocument(id: number, data: Partial<Document>): Promise<Document> {
    return this.request<Document>(`/admin/documents/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteDocument(id: number): Promise<void> {
    await this.request(`/admin/documents/${id}/`, { method: 'DELETE' })
  }

  // Achievements API
  async getAchievements(filters: FilterParams = {}): Promise<PaginatedResponse<Achievement>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('page_size', String(filters.pageSize))
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)

    return this.request<PaginatedResponse<Achievement>>(`/admin/achievements/?${params.toString()}`)
  }

  async getAchievement(id: number): Promise<Achievement> {
    return this.request<Achievement>(`/admin/achievements/${id}/`)
  }

  async createAchievement(data: Partial<Achievement>): Promise<Achievement> {
    return this.request<Achievement>('/admin/achievements/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAchievement(id: number, data: Partial<Achievement>): Promise<Achievement> {
    return this.request<Achievement>(`/admin/achievements/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteAchievement(id: number): Promise<void> {
    await this.request(`/admin/achievements/${id}/`, { method: 'DELETE' })
  }

  // Users API
  async getUsers(filters: FilterParams = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('page_size', String(filters.pageSize))
    if (filters.search) params.set('search', filters.search)

    return this.request<PaginatedResponse<User>>(`/admin/users/?${params.toString()}`)
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/admin/users/${id}/`)
  }

  // Categories API
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/admin/categories/')
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.request<Category>('/admin/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/admin/categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(id: number): Promise<void> {
    await this.request(`/admin/categories/${id}/`, { method: 'DELETE' })
  }

  // Tags API
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/admin/tags/')
  }

  async createTag(data: Partial<Tag>): Promise<Tag> {
    return this.request<Tag>('/admin/tags/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTag(id: number, data: Partial<Tag>): Promise<Tag> {
    return this.request<Tag>(`/admin/tags/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteTag(id: number): Promise<void> {
    await this.request(`/admin/tags/${id}/`, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
export default apiClient
