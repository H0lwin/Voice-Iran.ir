'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface EditorPanelProps {
  title: string
  icon?: LucideIcon
  open: boolean
  onOpenChange: () => void
  children: ReactNode
}

export function EditorPanel({
  title,
  icon: Icon = Clock,
  open,
  onOpenChange,
  children,
}: EditorPanelProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="size-4" />
              {title}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

