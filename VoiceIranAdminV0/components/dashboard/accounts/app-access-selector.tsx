'use client'

import { useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type AppItem = {
  id: string
  label: string
}

interface AppAccessSelectorProps {
  apps: AppItem[]
  allowedApps: string[]
  onChange: (next: { allowedApps: string[]; deniedApps: string[] }) => void
}

export function AppAccessSelector({
  apps,
  allowedApps,
  onChange,
}: AppAccessSelectorProps) {
  const allowedSet = useMemo(() => new Set(allowedApps), [allowedApps])

  const updateAllowed = (appId: string, checked: boolean) => {
    const nextAllowedSet = new Set(allowedApps)
    if (checked) {
      nextAllowedSet.add(appId)
    } else {
      nextAllowedSet.delete(appId)
    }
    const nextAllowed = Array.from(nextAllowedSet)
    const nextDenied = apps
      .map((app) => app.id)
      .filter((id) => !nextAllowedSet.has(id))

    onChange({
      allowedApps: nextAllowed,
      deniedApps: nextDenied,
    })
  }

  return (
    <div className="space-y-2 rounded-[var(--radius-md)] border border-border p-3">
      <p className="text-small text-muted-foreground">
        فقط اپ‌های مجاز را انتخاب کنید. هر اپی که انتخاب نشود، به‌صورت خودکار مستثنی در نظر گرفته می‌شود.
      </p>
      <div className="max-h-[46vh] space-y-2 overflow-y-auto pe-1">
        {apps.map((app) => {
          const selected = allowedSet.has(app.id)
          return (
            <div key={app.id} className="rounded-[var(--radius-sm)] border border-border px-2 py-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => updateAllowed(app.id, Boolean(checked))}
                  aria-label={`انتخاب ${app.label}`}
                />
                <Label className="text-small">{app.label}</Label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
