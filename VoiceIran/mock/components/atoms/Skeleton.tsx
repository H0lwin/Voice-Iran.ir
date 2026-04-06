'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md bg-[var(--color-ink-raised)]',
        className
      )}
    />
  )
}

// Card skeleton for news/achievement cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg overflow-hidden', className)}>
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// Martyr card skeleton
export function MartyrCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center p-6', className)}>
      <Skeleton className="w-24 h-24 rounded-full" />
      <Skeleton className="h-5 w-32 mt-4" />
      <Skeleton className="h-4 w-24 mt-2" />
      <Skeleton className="h-4 w-20 mt-2" />
    </div>
  )
}

// Stat counter skeleton
export function StatSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2 p-6', className)}>
      <Skeleton className="w-12 h-12 rounded-lg" />
      <Skeleton className="h-10 w-20 mt-2" />
      <Skeleton className="h-4 w-28" />
    </div>
  )
}

// Hero skeleton
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-svh w-full', className)}>
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex items-end pb-24 px-8 lg:px-20">
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-[3px] w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </div>
  )
}

// Article body skeleton
export function ArticleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 max-w-3xl mx-auto', className)}>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
    </div>
  )
}
