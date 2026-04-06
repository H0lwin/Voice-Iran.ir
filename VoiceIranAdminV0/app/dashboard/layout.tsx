'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { useAuthStore } from '@/lib/store/auth-store'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, isHydrated } = useAuthStore()

  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isHydrated, isAuthenticated, isLoading, router])

  // Show loading skeleton while hydrating or checking auth
  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen bg-background">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-[240px] flex-col border-s border-border bg-sidebar p-4 gap-4">
          <Skeleton className="h-10 w-full bg-sidebar-accent" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-sidebar-accent" />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-14 border-b border-border px-4 flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated after hydration, show nothing (redirect will happen)
  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 overflow-auto px-4 pb-20 pt-4 md:px-6 md:pb-6 md:pt-5">
          {children}
        </div>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
