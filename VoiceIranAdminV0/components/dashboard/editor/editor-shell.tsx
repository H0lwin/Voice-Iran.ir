'use client'

import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditorShellProps {
  title: string
  subtitle?: string
  onBack: () => void
  actions: ReactNode
  children: ReactNode
  sidebar: ReactNode
}

export function EditorShell({ title, subtitle, onBack, actions, children, sidebar }: EditorShellProps) {
  return (
    <div className="editor-rtl pb-10">
      <header className="sticky top-0 z-[180] flex min-h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowRight className="size-5" />
          </Button>
          <div>
            <h2 className="text-base">{title}</h2>
            {subtitle ? <div className="text-caption text-muted-foreground">{subtitle}</div> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </header>

      <div className="flex flex-col gap-6 pt-4 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 lg:[width:calc(100%-332px)]">{children}</section>
        <aside className="w-full lg:w-[300px] lg:shrink-0">
          <div className="space-y-4 lg:sticky lg:top-20">{sidebar}</div>
        </aside>
      </div>
    </div>
  )
}
