'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Newspaper,
  Rocket,
  Heart,
  FileText,
  Trophy,
  Users,
  Shield,
  Key,
  Settings,
  Globe,
  Calendar,
  Bell,
  Code,
  BarChart3,
  Tags,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store/auth-store'
import { useAppPermissions } from '@/lib/auth/use-permission'
import { notificationsApi } from '@/lib/api/api-client'

const navigation = {
  main: [{ title: 'داشبورد', icon: LayoutDashboard, href: '/dashboard' }],
  content: {
    title: 'محتوا',
    items: [
      { title: 'اخبار', icon: Newspaper, href: '/dashboard/news', app: 'news' as const },
      { title: 'تسلیحات', icon: Rocket, href: '/dashboard/arsenal', app: 'arsenal' as const },
      { title: 'شهدا', icon: Heart, href: '/dashboard/martyrs', app: 'martyrs' as const },
      { title: 'اسناد', icon: FileText, href: '/dashboard/documents', app: 'documents' as const },
      {
        title: 'دستاوردها',
        icon: Trophy,
        href: '/dashboard/achievements',
        app: 'achievements' as const,
      },
    ],
  },
  management: {
    title: 'مدیریت',
    items: [
      { title: 'کاربران', icon: Users, href: '/dashboard/accounts/users', app: 'accounts' as const },
      { title: 'نقش‌ها', icon: Shield, href: '/dashboard/accounts/roles', app: 'accounts' as const },
      {
        title: 'سطوح دسترسی',
        icon: Key,
        href: '/dashboard/accounts/profiles',
        app: 'accounts' as const,
      },
    ],
  },
  settings: {
    title: 'تنظیمات',
    items: [
      { title: 'هسته', icon: Settings, href: '/dashboard/settings', app: 'core' as const },
      { title: 'زبان‌ها', icon: Globe, href: '/dashboard/localization/languages', app: 'core' as const },
      { title: 'طبقه‌بندی', icon: Tags, href: '/dashboard/taxonomy', app: 'taxonomy' as const },
      { title: 'سئو', icon: Globe, href: '/dashboard/seo', app: 'seo' as const },
      { title: 'انتشار', icon: Calendar, href: '/dashboard/publishing', app: 'publishing' as const },
      {
        title: 'اعلان‌ها',
        icon: Bell,
        href: '/dashboard/notifications-settings',
        app: 'notifications' as const,
      },
      { title: 'API', icon: Code, href: '/dashboard/api-management', app: 'api' as const },
    ],
  },
  analytics: [
    { title: 'تحلیل و گزارش', icon: BarChart3, href: '/dashboard/analytics', app: 'analytics' as const },
  ],
}

function AutoCollapseSidebar() {
  const { isMobile, setOpen } = useSidebar()

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1199px)')
    const apply = () => {
      if (!isMobile) {
        setOpen(!media.matches)
      }
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [isMobile, setOpen])

  return null
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const permissions = useAppPermissions()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    notificationsApi
      .getUnreadCount()
      .then(setUnreadCount)
      .catch(() => setUnreadCount(0))
  }, [])

  const userInitials = useMemo(() => {
    const first = user?.firstName?.trim()?.[0] ?? ''
    const last = user?.lastName?.trim()?.[0] ?? ''
    return `${first}${last}`.trim() || user?.fullName?.trim()?.[0] || 'U'
  }, [user])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const isCurrent = (href: string) => pathname === href
  const isParent = (href: string) => pathname.startsWith(`${href}/`)

  const itemClasses = (href: string) => {
    if (isCurrent(href)) {
      return 'h-10 px-3 rounded-[var(--radius-md)] bg-[#E2E8F0] dark:bg-[#1E293B] border-r-2 border-[var(--color-primary)]'
    }
    if (isParent(href)) {
      return 'h-10 px-3 rounded-[var(--radius-md)] bg-[#EEF2F7] dark:bg-[#172133] border-r-2 border-dashed border-[var(--color-primary)]'
    }
    return 'h-10 px-3 rounded-[var(--radius-md)] hover:bg-sidebar-accent'
  }

  const itemClickCloseMobile = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar side="right" collapsible="icon" className="border-s border-sidebar-border">
      <AutoCollapseSidebar />

      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-3 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-10 px-3">
              <Link href="/dashboard" onClick={itemClickCloseMobile}>
                <div className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-label">صدای ایران</span>
                  <span className="text-caption text-sidebar-foreground/70">پنل مدیریت</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-1">
        <SidebarGroup className="px-2 pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.main.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isCurrent(item.href) || isParent(item.href)}
                    className={itemClasses(item.href)}
                  >
                    <Link href={item.href} onClick={itemClickCloseMobile}>
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SectionGroup title={navigation.content.title}>
          {navigation.content.items
            .filter((item) => permissions[item.app])
            .map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isCurrent(item.href) || isParent(item.href)}
                  className={itemClasses(item.href)}
                >
                  <Link href={item.href} onClick={itemClickCloseMobile}>
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SectionGroup>

        {permissions.accounts && (
          <SectionGroup title={navigation.management.title}>
            {navigation.management.items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isCurrent(item.href) || isParent(item.href)}
                  className={itemClasses(item.href)}
                >
                  <Link href={item.href} onClick={itemClickCloseMobile}>
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SectionGroup>
        )}

        <SectionGroup title={navigation.settings.title} defaultOpen={false}>
          {navigation.settings.items
            .filter((item) => permissions[item.app])
            .map((item) => (
              <SidebarMenuItem key={item.href} className="relative">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isCurrent(item.href) || isParent(item.href)}
                  className={itemClasses(item.href)}
                >
                  <Link href={item.href} onClick={itemClickCloseMobile}>
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.app === 'notifications' && unreadCount > 0 && state !== 'collapsed' && (
                  <span className="absolute left-2 top-2 rounded-[var(--radius-sm)] bg-destructive px-1.5 text-caption text-white">
                    {unreadCount > 99 ? '۹۹+' : unreadCount.toLocaleString('fa-IR')}
                  </span>
                )}
              </SidebarMenuItem>
            ))}
        </SectionGroup>

        {permissions.analytics && (
          <SidebarGroup className="px-2 pb-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.analytics.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isCurrent(item.href) || isParent(item.href)}
                      className={itemClasses(item.href)}
                    >
                      <Link href={item.href} onClick={itemClickCloseMobile}>
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="h-[72px] border-t border-sidebar-border px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="h-14 px-3 data-[state=open]:bg-sidebar-accent">
                  <Avatar className="size-8 rounded-[var(--radius-sm)]">
                    <AvatarImage src={user?.avatar} alt={user?.fullName} />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col text-start leading-none">
                    <span className="truncate text-small font-medium">{user?.fullName}</span>
                    <Badge variant="outline" className="mt-1 w-fit border-sidebar-border text-caption">
                      {user?.role?.name}
                    </Badge>
                  </div>
                  <ChevronDown className="size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="top" align="end" sideOffset={8}>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" onClick={itemClickCloseMobile}>
                    تنظیمات پروفایل
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="me-2 size-4" />
                  خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function SectionGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <SidebarGroup className="px-2 pb-0">
      <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
        <SidebarGroupLabel asChild className="mb-2 mt-4 h-5 px-2 text-label text-sidebar-foreground/75">
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <span>{title}</span>
            <ChevronDown className="size-4 transition-transform duration-[220ms] ease-in-out group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>{children}</SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  )
}
