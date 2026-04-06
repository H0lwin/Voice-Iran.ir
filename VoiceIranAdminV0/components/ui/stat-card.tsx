'use client'

import { type LucideIcon, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatPersianNumber } from '@/lib/utils/date'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  const formattedValue = typeof value === 'number' ? formatPersianNumber(value) : value

  const trendTone = trend
    ? trend.value > 0
      ? 'text-success'
      : trend.value < 0
      ? 'text-destructive'
      : 'text-muted-foreground'
    : ''

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-small text-muted-foreground">{title}</p>
            <p className="text-2xl font-medium">{formattedValue}</p>
            {description && <p className="text-caption text-muted-foreground">{description}</p>}
            {trend && (
              <div className={cn('inline-flex items-center gap-1 text-caption', trendTone)}>
                {trend.value > 0 ? (
                  <ArrowUpRight className="size-4" />
                ) : trend.value < 0 ? (
                  <ArrowDownRight className="size-4" />
                ) : (
                  <Minus className="size-4" />
                )}
                <span>{formatPersianNumber(Math.abs(trend.value))}%</span>
                <span className="text-muted-foreground">نسبت به ۷ روز گذشته</span>
              </div>
            )}
          </div>
          <div className="rounded-[var(--radius-md)] bg-primary/10 p-2.5">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}