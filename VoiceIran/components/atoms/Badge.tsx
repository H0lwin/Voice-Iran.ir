'use client'

import { cn } from '@/lib/utils'

export type BadgeVariant = 'gold' | 'crimson' | 'emerald' | 'blue' | 'muted' | 'amber'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-[var(--color-gold)] text-[var(--color-ink)]',
  crimson: 'bg-[var(--color-crimson)] text-[var(--color-text-primary)]',
  emerald: 'bg-[var(--color-emerald)] text-[var(--color-text-primary)]',
  blue: 'bg-[var(--color-blue)] text-[var(--color-text-primary)]',
  amber: 'bg-amber-600 text-[var(--color-ink)]',
  muted: 'bg-[var(--color-ink-muted)] text-[var(--color-text-secondary)]',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export function Badge({ 
  variant = 'muted', 
  children, 
  className,
  size = 'sm'
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  )
}

// Verification badge specifically for official/documented/claimed status
interface VerificationBadgeProps {
  status: 'official' | 'documented' | 'claimed'
  className?: string
}

const verificationConfig = {
  official: { label: 'رسمی', variant: 'emerald' as BadgeVariant },
  documented: { label: 'مستند', variant: 'blue' as BadgeVariant },
  claimed: { label: 'ادعایی', variant: 'amber' as BadgeVariant },
}

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const config = verificationConfig[status]
  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      {status === 'official' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {config.label}
    </Badge>
  )
}
