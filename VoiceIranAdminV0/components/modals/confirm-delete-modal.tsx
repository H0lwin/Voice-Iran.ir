'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'

interface ConfirmDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  requireConfirmation?: boolean
  isLoading?: boolean
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  requireConfirmation = true,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const confirmWord = 'حذف'

  const resolvedTitle = title || `حذف ${itemName || 'مورد'}`
  const resolvedDescription = description || 'برای تأیید، کلمه «حذف» را تایپ کنید'

  const canDelete = useMemo(
    () => !requireConfirmation || confirmText.trim() === confirmWord,
    [confirmText, requireConfirmation],
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setConfirmText('')
    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[420px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/15">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-destructive">{resolvedTitle}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">{resolvedDescription}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {itemName && <div className="rounded-[var(--radius-md)] border border-border bg-muted px-3 py-2 text-small">{itemName}</div>}

        {requireConfirmation && (
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="حذف"
            disabled={isLoading}
          />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              if (!canDelete || isLoading) return
              onConfirm()
            }}
            disabled={!canDelete || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {isLoading ? 'در حال حذف...' : 'حذف'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}