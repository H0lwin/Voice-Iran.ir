'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  X,
  FileClock,
  XCircle,
  UserPlus,
  CalendarCheck,
  AlertTriangle,
} from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { notificationsApi } from '@/lib/api/api-client'
import { formatJalaliDateTime } from '@/lib/utils/date'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUIStore } from '@/lib/store/ui-store'
import type { Notification } from '@/lib/types'
import { cn } from '@/lib/utils'
import { BreadcrumbNav } from './breadcrumb-nav'

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const {
    notificationPanelOpen,
    setNotificationPanelOpen,
    sessionExpired,
    sessionNextPath,
    setSessionExpired,
  } = useUIStore()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pulseBell, setPulseBell] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [items, count] = await Promise.all([
          notificationsApi.getAll(),
          notificationsApi.getUnreadCount(),
        ])
        setNotifications(items)
        setUnreadCount((prev) => {
          if (count > prev) {
            setPulseBell(true)
            setTimeout(() => setPulseBell(false), 700)
          }
          return count
        })
      } catch {
        setNotifications([])
        setUnreadCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
    const timer = setInterval(loadNotifications, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const sessionHandler = () => {
      setSessionExpired(true, pathname)
    }

    window.addEventListener('voiceiran:session-expired', sessionHandler)
    return () => window.removeEventListener('voiceiran:session-expired', sessionHandler)
  }, [pathname, setSessionExpired])

  const handleMarkAllAsRead = async () => {
    await notificationsApi.markAllAsRead()
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
    setUnreadCount(0)
  }

  const handleMarkAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id)
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    setNotificationPanelOpen(false)
  }

  const handleRelogin = () => {
    logout()
    const next = sessionNextPath || '/dashboard'
    router.push(`/login?next=${encodeURIComponent(next)}`)
    setSessionExpired(false, null)
  }

  const userInitial = useMemo(() => user?.fullName?.trim()?.charAt(0) || 'U', [user])

  const getIcon = (title: string) => {
    if (title.includes('بررسی')) return FileClock
    if (title.includes('رد')) return XCircle
    if (title.includes('کاربر')) return UserPlus
    return CalendarCheck
  }

  return (
    <>
      <header className="sticky top-0 z-[200] flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger className="-me-1" />
          <Separator orientation="vertical" className="h-6" />
          <BreadcrumbNav />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 rounded-[var(--radius-md)]"
            onClick={() => setNotificationPanelOpen(true)}
          >
            <Bell className={cn('size-5', pulseBell && 'animate-pulse')} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white">
                {unreadCount > 99 ? '۹۹+' : unreadCount.toLocaleString('fa-IR')}
              </span>
            )}
          </Button>

          <Avatar className="size-8 rounded-[var(--radius-sm)]">
            <AvatarImage src={user?.avatar} alt={user?.fullName} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-[var(--z-sidebar-overlay)] bg-black/25 transition-opacity duration-[220ms] ease-in-out',
          notificationPanelOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setNotificationPanelOpen(false)}
      />

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-0 z-[var(--z-popover)] w-full border-r border-border bg-background shadow-elevated transition-transform duration-[220ms] ease-in-out md:w-[360px]',
          notificationPanelOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-4">
          <h2 className="text-base font-medium">اعلان‌ها</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              علامت همه خوانده‌شده
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setNotificationPanelOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="h-[calc(100%-56px)] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-[var(--radius-md)] border border-border p-3">
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="mb-1 h-3 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-muted-foreground">
              اعلان جدیدی وجود ندارد
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((item) => {
                const Icon = getIcon(item.title)
                return (
                  <button
                    key={item.id}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-right transition-colors duration-[150ms] hover:bg-muted',
                      !item.isRead && 'bg-info/5',
                    )}
                    onClick={() => handleMarkAsRead(item.id)}
                  >
                    <Icon className="mt-0.5 size-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        {!item.isRead && <span className="mt-1 size-2 rounded-full bg-info" />}
                      </div>
                      <p className="text-small text-muted-foreground">{item.message}</p>
                      <p className="mt-1 text-caption text-muted-foreground">{formatJalaliDateTime(item.createdAt)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      <Dialog open={sessionExpired}>
        <DialogContent className="sm:max-w-[420px]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              نشست منقضی شد
            </DialogTitle>
            <DialogDescription>
              نشست شما منقضی شده است. لطفاً مجدداً وارد شوید.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={handleRelogin}>
              ورود مجدد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
