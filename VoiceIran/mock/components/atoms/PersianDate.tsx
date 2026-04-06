'use client'

import { formatPersianDate, getCurrentJalaliDate, toPersianDigits, PERSIAN_MONTHS } from '@/lib/persian-utils'
import { cn } from '@/lib/utils'

interface PersianDateProps {
  date?: Date
  format?: 'full' | 'short' | 'numeric'
  className?: string
  showIcon?: boolean
}

export function PersianDate({ 
  date, 
  format = 'full', 
  className,
  showIcon = false
}: PersianDateProps) {
  const dateToFormat = date || new Date()
  const formattedDate = formatPersianDate(dateToFormat, format)

  return (
    <time 
      dateTime={dateToFormat.toISOString()} 
      className={cn('text-sm text-[var(--color-text-tertiary)] inline-flex items-center gap-1', className)}
    >
      {showIcon && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )}
      {formattedDate}
    </time>
  )
}

// Current date display for header
export function CurrentDate({ className }: { className?: string }) {
  const today = getCurrentJalaliDate()
  const formattedDate = `${toPersianDigits(today.jd)} ${PERSIAN_MONTHS[today.jm - 1]} ${toPersianDigits(today.jy)}`
  
  return (
    <span className={cn('text-sm text-[var(--color-text-secondary)]', className)}>
      {formattedDate}
    </span>
  )
}
