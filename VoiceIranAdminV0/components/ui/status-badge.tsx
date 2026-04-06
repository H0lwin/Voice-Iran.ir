'use client'

import { Badge } from '@/components/ui/badge'
import { type ContentStatus, STATUS_LABELS } from '@/lib/types/content'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: ContentStatus
  className?: string
}

const statusStyles: Record<ContentStatus, string> = {
  draft: 'bg-warning/15 text-warning hover:bg-warning/20',
  pending_review: 'bg-info/15 text-info hover:bg-info/20',
  published: 'bg-success/15 text-success hover:bg-success/20',
  rejected: 'bg-destructive/15 text-destructive hover:bg-destructive/20',
  archived: 'bg-muted text-muted-foreground hover:bg-muted',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(statusStyles[status], 'font-medium', className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
