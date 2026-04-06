'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, ChartNoAxesColumn, ChartSpline, PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { analyticsApi } from '@/lib/api/api-client'
import { usePermission } from '@/lib/auth/use-permission'
import { formatPersianNumber } from '@/lib/utils/date'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsDashboard } from '@/lib/types'
import { toast } from 'sonner'

const PIE_COLORS = ['var(--color-primary)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-success)']

export default function AnalyticsPage() {
  const { hasPermission } = usePermission('analytics')
  const [data, setData] = useState<AnalyticsDashboard | null>(null)

  useEffect(() => {
    if (!hasPermission) return
    analyticsApi
      .getDashboard('month')
      .then(setData)
      .catch(() => {
        toast.error('خطا در دریافت گزارش')
        setData(null)
      })
  }, [hasPermission])

  if (!hasPermission) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">
        دسترسی به تحلیل و گزارش برای نقش شما فعال نیست.
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[var(--radius-lg)]" />
        ))}
      </div>
    )
  }

  const kpis = [
    { label: 'بازدید صفحه', value: data.totalPageViews, icon: TrendingUp },
    { label: 'بازدیدکننده یکتا', value: data.totalUniqueVisitors, icon: ChartSpline },
    { label: 'اقلام محتوا', value: data.totalContentItems, icon: ChartNoAxesColumn },
    { label: 'منتشرشده امروز', value: data.publishedToday, icon: BarChart3 },
  ]

  const lineData = data.visitStats.slice(-14).map((item) => ({
    day: item.date.slice(-2),
    pageViews: item.pageViews,
    uniqueVisitors: item.uniqueVisitors,
  }))

  const barData = data.contentDistribution.map((item) => ({
    name: item.contentTypeLabel,
    count: item.count,
    viewCount: item.viewCount,
  }))

  const pieData = data.deviceBreakdown.map((item) => ({
    name: item.device,
    value: item.percentage,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1>تحلیل و گزارش</h1>
        <p className="text-muted-foreground">نمای جامع عملکرد ماه جاری</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border/80 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{formatPersianNumber(kpi.value)}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">روند بازدید (۱۴ روز اخیر)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-72 w-full"
              config={{
                pageViews: { label: 'بازدید صفحه', color: 'var(--color-primary)' },
                uniqueVisitors: { label: 'بازدیدکننده یکتا', color: 'var(--color-info)' },
              }}
            >
              <LineChart data={lineData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={44} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="pageViews" stroke="var(--color-pageViews)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="uniqueVisitors" stroke="var(--color-uniqueVisitors)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ترکیب دستگاه‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChartContainer
              className="h-64 w-full"
              config={{
                value: { label: 'درصد', color: 'var(--color-primary)' },
              }}
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-border px-2 py-1.5 text-small">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span>{item.name}</span>
                  <span className="ms-auto text-muted-foreground">{item.value}٪</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">توزیع محتوای ثبت‌شده</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-72 w-full"
              config={{
                count: { label: 'تعداد آیتم', color: 'var(--color-primary)' },
                viewCount: { label: 'بازدید', color: 'var(--color-success)' },
              }}
            >
              <BarChart data={barData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={48} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="viewCount" fill="var(--color-viewCount)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">پربازدیدترین‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.popularContent.map((item) => (
              <div key={item.id} className="rounded-[var(--radius-md)] border border-border p-3">
                <p className="line-clamp-2 text-small font-medium">{item.title}</p>
                <p className="mt-1 text-caption text-muted-foreground">
                  {formatPersianNumber(item.viewCount)} بازدید · {item.contentType}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
