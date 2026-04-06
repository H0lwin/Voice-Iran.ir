// UI State Store using Zustand
import { create } from 'zustand'
import type { AppName } from '@/lib/types'

interface UIState {
  // Sidebar state
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeApp: AppName | null
  
  // Mobile navigation
  mobileNavOpen: boolean
  
  // Notification panel
  notificationPanelOpen: boolean
  sessionExpired: boolean
  sessionNextPath: string | null
  
  // Modals
  activeModal: string | null
  modalData: Record<string, unknown> | null
  
  // Breadcrumb
  breadcrumbs: { label: string; href?: string }[]
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setActiveApp: (app: AppName | null) => void
  setMobileNavOpen: (open: boolean) => void
  setNotificationPanelOpen: (open: boolean) => void
  setSessionExpired: (expired: boolean, nextPath?: string | null) => void
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void
  setBreadcrumbs: (breadcrumbs: { label: string; href?: string }[]) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeApp: null,
  mobileNavOpen: false,
  notificationPanelOpen: false,
  sessionExpired: false,
  sessionNextPath: null,
  activeModal: null,
  modalData: null,
  breadcrumbs: [],
  
  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setActiveApp: (app) => set({ activeApp: app }),
  
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),

  setSessionExpired: (expired, nextPath = null) =>
    set({ sessionExpired: expired, sessionNextPath: nextPath }),
  
  openModal: (modalId, data) => set({ activeModal: modalId, modalData: data || null }),
  
  closeModal: () => set({ activeModal: null, modalData: null }),
  
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}))
