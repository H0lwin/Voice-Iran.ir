'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Check, Clock3, Minus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { StatusBadge } from '@/components/ui/status-badge'
import apiClient from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth-store'
import { formatJalaliDateTime, formatPersianNumber } from '@/lib/utils/date'
import type { Post } from '@/lib/types'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

type Delta = { value: number }

type OverviewStats = {
  totalPosts: number
  publishedPosts: number
  pendingReview: number
  draftPosts: number
  totalMartyrs: number
  publishedMartyrs: number
  totalWeapons: number
  publishedWeapons: number
  totalDocuments: number
  publishedDocuments: number
  totalAchievements: number
  verifiedAchievements: number
  totalUsers: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const role = user?.role?.codename ?? 'viewer'
  const [isLoading, setIsLoading] = useState(true)
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(7)
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])

  const deltas = useMemo<Record<string, Delta>>(
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
      // Get dashboard stats
      const dashboardStats = await apiClient.getDashboardStats()
      setStats(dashboardStats)

      // Get recent posts
      const postsResponse = await apiClient.getPosts({ page: 1, pageSize: 20 })
      setRecentPosts(postsResponse.data || [])
      
      // Get pending posts
      const pendingResponse = await apiClient.getPosts({ page: 1, pageSize: 20, status: 'review' })
      setPendingPosts(pendingResponse.data || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [rangeDays])

  const approvePending = async (post: Post) => {
    try {
      await apiClient.publishPost(Number(post.id))
      await load()
    } catch (error) {
      console.error('Failed to publish post:', error)
    }
  }

  const rejectPending = async (post: Post) => {
    try {
      await apiClient.rejectPost(Number(post.id), 'رد از داشبورد')
      await load()
    } catch (error) {
      console.error('Failed to reject post:', error)
    }
  }

  if (isLoading || !stats) {
    return <DashboardSkeleton />
  }

  const kpiItems = [
    { key: 'publishedNews' as const, title: 'اخبار منتشرشده', value: stats.publishedPosts },
    { key: 'publishedMartyrs' as const, title: 'شهدا ثبت‌شده', value: stats.publishedMartyrs },
    { key: 'verifiedAchievements' as const, title: 'دستاوردهای تأییدشده', value: stats.verifiedAchievements },
    { key: 'totalUsers' as const, title: 'کاربران', value: stats.totalUsers },
    { key: 'publishedWeapons' as const, title: 'تسلیحات منتشرشده', value: stats.publishedWeapons },
    { key: 'publishedDocuments' as const, title: 'مستندات منتشرشده', value: stats.publishedDocuments },
  ].filter((item) => !(role === 'editor' && item.key === 'totalUsers'))

  const trafficTrend = recentPosts
    .slice(0, rangeDays)
    .map((post: Post, index: number) => ({ day: String(index + 1), views: post.viewCount || 0 }))

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpiItems.map((item) => (
          <KpiCard key={item.key} title={item.title} value={item.value} delta={deltas[item.key]?.value || 0} />
        ))}
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
              pendingPosts.map((post: Post) => (
                <div key={post.id} className="rounded-[var(--radius-md)] border border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-small font-medium">{post.title || post.slug}</p>
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
            <CardTitle className="text-base">خلاصه وضعیت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">کل اخبار</p>
                <p className="text-xl font-medium">{formatPersianNumber(stats.totalPosts)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">در انتظار بازبینی</p>
                <p className="text-xl font-medium">{formatPersianNumber(stats.pendingReview)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">کل شهدا</p>
                <p className="text-xl font-medium">{formatPersianNumber(stats.totalMartyrs)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">کل دستاوردها</p>
                <p className="text-xl font-medium">{formatPersianNumber(stats.totalAchievements)}</p>
              </div>
            </div>
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
