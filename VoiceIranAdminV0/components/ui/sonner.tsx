'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-left"
      dir="rtl"
      visibleToasts={3}
      richColors
      expand={false}
      closeButton
      toastOptions={{
        classNames: {
          toast: 'font-sans shadow-subtle border border-border rounded-lg',
          title: 'text-sm font-medium',
          description: 'text-small',
        },
        duration: 3000,
      }}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--color-success)',
          '--error-bg': 'var(--color-danger)',
          '--warning-bg': 'var(--color-warning)',
          '--info-bg': 'var(--color-info)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }