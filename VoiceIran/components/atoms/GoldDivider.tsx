'use client'

import { cn } from '@/lib/utils'

interface GoldDividerProps {
  className?: string
  variant?: 'full' | 'simple' | 'line'
}

export function GoldDivider({ className, variant = 'full' }: GoldDividerProps) {
  if (variant === 'line') {
    return (
      <div className={cn('h-px bg-gradient-to-l from-transparent via-[var(--color-gold-dim)] to-transparent', className)} />
    )
  }

  if (variant === 'simple') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[var(--color-gold-dim)]" />
        <div className="w-2 h-2 rotate-45 bg-[var(--color-gold)]" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[var(--color-gold-dim)]" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-4 my-16', className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[var(--color-gold-dim)]" />
      <div className="w-2 h-2 rotate-45 bg-[var(--color-gold)]" />
      <div className="w-1 h-1 rotate-45 bg-[var(--color-gold)]/50" />
      <div className="w-2 h-2 rotate-45 bg-[var(--color-gold)]" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[var(--color-gold-dim)]" />
    </div>
  )
}

// Vertical gold bar used in section headers
export function GoldBar({ className }: { className?: string }) {
  return (
    <div className={cn('w-1 h-8 bg-[var(--color-gold)] rounded-full', className)} />
  )
}

// Horizontal gold accent line
export function GoldAccent({ className }: { className?: string }) {
  return (
    <div className={cn('h-[3px] bg-gradient-to-l from-[var(--color-gold)] to-transparent', className)} />
  )
}
