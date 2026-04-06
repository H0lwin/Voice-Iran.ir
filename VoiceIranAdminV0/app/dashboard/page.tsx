'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Check, Clock3, Minus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  achievementsApi,
  dashboardApi,
  documentsApi,
  martyrsApi,
  postsApi,
  publishingApi,
  settingsApi,
  weaponsApi,
} from '@/lib/api/api-client'
import { useAuthStore } from '@/lib/store/auth-store'
import { formatJalaliDateTime, formatPersianNumber } from '@/lib/utils/date'
import type { ContentItem, Post } from '@/lib/types'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

type Delta = { value: number }

type OverviewStats = {
  publishedNews: number
  publishedMartyrs: number
  verifiedAchievements: number
  todayViews: number
  publishedWeapons: number
  publishedDocuments: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const role = user?.role?.codename ?? 'viewer'
  const [isLoading, setIsLoading] = useState(true)
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(7)
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])
  const [futureSchedules, setFutureSchedules] = useState<Array<{ id: string; contentTitle: string; scheduledAt: string }>>([])
  const [liveStats, setLiveStats] = useState<Array<{ id: string; label: string; value: number }>>([])
  const [activeBanners, setActiveBanners] = useState<Array<{ id: string; title: string; subtitle?: string }>>([])

  const deltas = useMemo<Record<keyof OverviewStats, Delta>>(
    () => ({
      publishedNews: { value: 4 },
      publishedMartyrs: { value: 2 },
      verifiedAchievements: { value: 3 },
      todayViews: { value: -1 },
      publishedWeapons: { value: 1 },
      publishedDocuments: { value: 2 },
    }),
    [],
  )

  const load = async () => {
    setIsLoading(true)
    try {
      const [dashboard, news, martyrs, achievements, weapons, documents, schedules, coreStats, banners] = await Promise.all([
        dashboardApi.getStats(),
        postsApi.getAll({ page: 1, pageSize: 500 }),
        martyrsApi.getAll({ page: 1, pageSize: 500 }),
        achievementsApi.getAll({ page: 1, pageSize: 500 }),
        weaponsApi.getAll({ page: 1, pageSize: 500 }),
        documentsApi.getAll({ page: 1, pageSize: 500 }),
        publishingApi.getSchedules(),
        settingsApi.getLiveStats(),
        settingsApi.getBanners(),
      ])

      setStats({
        publishedNews: news.data.filter((item) => item.status === 'published').length,
        publishedMartyrs: martyrs.data.filter((item) => item.status === 'published').length,
        verifiedAchievements: achievements.data.filter((item) => item.verificationStatus === 'verified' || item.status === 'published').length,
        todayViews: dashboard.totalPosts * 42,
        publishedWeapons: weapons.data.filter((item) => item.status === 'published').length,
        publishedDocuments: documents.data.filter((item) => item.status === 'published').length,
      })

      setRecentPosts(news.data.slice(0, Math.max(8, rangeDays)))
      setPendingPosts(news.data.filter((item) => item.status === 'pending_review').slice(0, 5))
      setFutureSchedules(
        schedules
          .filter((item) => item.status === 'pending')
          .slice(0, 5)
          .map((item) => ({ id: item.id, contentTitle: item.contentTitle, scheduledAt: item.scheduledAt })),
      )
      setLiveStats(coreStats.filter((item) => item.isActive).map((item) => ({ id: item.id, label: item.label, value: item.value })))
      setActiveBanners(banners.filter((item) => item.isActive).slice(0, 2).map((item) => ({ id: item.id, title: item.title, subtitle: item.subtitle })))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [rangeDays])

  const approvePending = async (post: Post) => {
    await postsApi.updateStatus(post.id, 'published')
    await load()
  }

  const rejectPending = async (post: Post) => {
    await postsApi.updateStatus(post.id, 'rejected', 'رد از داشبورد')
    await load()
  }

  if (isLoading || !stats) {
    return <DashboardSkeleton />
  }

  const kpiItems = [
    { key: 'publishedNews' as const, title: 'اخبار منتشرشده', value: stats.publishedNews },
    { key: 'publishedMartyrs' as const, title: 'شهدا ثبت‌شده', value: stats.publishedMartyrs },
    { key: 'verifiedAchievements' as const, title: 'دستاوردهای تأییدشده', value: stats.verifiedAchievements },
    { key: 'todayViews' as const, title: 'بازدید امروز', value: stats.todayViews },
    { key: 'publishedWeapons' as const, title: 'تسلیحات منتشرشده', value: stats.publishedWeapons },
    { key: 'publishedDocuments' as const, title: 'مستندات منتشرشده', value: stats.publishedDocuments },
  ].filter((item) => !(role === 'editor' && item.key === 'todayViews'))

  const trafficTrend = recentPosts
    .slice(0, rangeDays)
    .map((post, index) => ({ day: String(index + 1), views: post.viewCount || 0 }))

  return (
    <div className="space-y-8">
      {activeBanners.length > 0 && (
        <div className="space-y-2">
          {activeBanners.map((banner) => (
            <div key={banner.id} className="rounded-[var(--radius-md)] border border-warning/40 bg-warning/10 px-4 py-2 text-small">
              <p className="font-medium">{banner.title}</p>
              {banner.subtitle ? <p className="text-muted-foreground">{banner.subtitle}</p> : null}
            </div>
          ))}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpiItems.map((item) => (
          <KpiCard key={item.key} title={item.title} value={item.value} delta={deltas[item.key].value} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">بازدید {formatPersianNumber(rangeDays)} روز اخیر</CardTitle>
            <div className="flex items-center gap-2">
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  size="sm"
                  variant={rangeDays === days ? 'default' : 'outline'}
                  onClick={() => setRangeDays(days as 7 | 30 | 90)}
                >
                  {days.toLocaleString('fa-IR')} روز
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-72 w-full" config={{ views: { label: 'بازدید', color: 'var(--color-primary)' } }}>
              <LineChart data={trafficTrend} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={44} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">زمان‌بندی‌های آینده</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {futureSchedules.length === 0 ? (
              <p className="text-small text-muted-foreground">زمان‌بندی فعالی وجود ندارد.</p>
            ) : (
              futureSchedules.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-md)] border border-border p-2">
                  <p className="line-clamp-1 text-small font-medium">{item.contentTitle}</p>
                  <p className="text-caption text-muted-foreground">{formatJalaliDateTime(item.scheduledAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">محتوای منتظر تأیید</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/news">مشاهده همه</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPosts.length === 0 ? (
              <p className="text-small text-muted-foreground">آیتمی برای بررسی وجود ندارد.</p>
            ) : (
              pendingPosts.map((post) => (
                <div key={post.id} className="rounded-[var(--radius-md)] border border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-small font-medium">{post.title}</p>
                    <StatusBadge status={post.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => void approvePending(post)}>
                      <Check className="me-1 size-4" />تأیید
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => void rejectPending(post)}>
                      <X className="me-1 size-4" />رد
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">آمار لحظه‌ای</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {liveStats.length === 0 ? (
              <p className="text-small text-muted-foreground">آمار فعالی ثبت نشده است.</p>
            ) : (
              liveStats.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-md)] border border-border p-3">
                  <p className="text-caption text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-medium">{formatPersianNumber(item.value)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function KpiCard({ title, value, delta }: { title: string; value: number; delta: number }) {
  const tone = delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-small text-muted-foreground">{title}</p>
        <p className="text-2xl font-medium">{formatPersianNumber(value)}</p>
        <div className={['flex items-center gap-1 text-caption', tone].join(' ')}>
          {delta > 0 ? <ArrowUpRight className="size-4" /> : delta < 0 ? <ArrowDownRight className="size-4" /> : <Minus className="size-4" />}
          <span>{formatPersianNumber(Math.abs(delta))}%</span>
          <span className="text-muted-foreground">نسبت به هفته قبل</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-[320px] rounded-[var(--radius-md)]" />
    </div>
  )
}
