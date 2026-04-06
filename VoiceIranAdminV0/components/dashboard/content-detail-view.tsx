'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatJalaliDateTime } from '@/lib/utils/date'
import type { ContentStatus } from '@/lib/types'

export type DetailModel = {
  id: string
  title: string
  status: ContentStatus
  excerpt?: string
  content: string
  createdAt: string
  author: { fullName: string }
}

export function ContentDetailView<T extends DetailModel>({
  params: paramsPromise,
  fetcher,
  listHref,
  typeTitle,
  extra,
}: {
  params: Promise<{ id: string }>
  fetcher: (id: string) => Promise<T | null>
  listHref: string
  typeTitle: string
  extra?: (item: T) => React.ReactNode
}) {
  const { id } = use(paramsPromise)
  const [item, setItem] = useState<T | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    void fetcher(id).then((res) => {
      if (!cancelled) setItem(res)
    })
    return () => {
      cancelled = true
    }
  }, [id, fetcher])

  if (item === undefined) {
    return <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-muted" />
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">مورد یافت نشد.</p>
        <Button variant="outline" asChild>
          <Link href={listHref}>بازگشت به فهرست</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={listHref} aria-label="بازگشت">
            <ArrowRight className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-medium">{item.title}</h1>
        <StatusBadge status={item.status} />
        <span className="text-caption text-muted-foreground">{typeTitle}</span>
      </div>

      {item.excerpt ? (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">خلاصه</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-small text-muted-foreground">{item.excerpt}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">محتوا</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert [direction:rtl]"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">اطلاعات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-small">
              <p>
                <span className="text-muted-foreground">نویسنده: </span>
                {item.author.fullName}
              </p>
              <p>
                <span className="text-muted-foreground">تاریخ ایجاد: </span>
                {formatJalaliDateTime(item.createdAt)}
              </p>
            </CardContent>
          </Card>
          {extra?.(item)}
        </div>
      </div>
    </div>
  )
}
