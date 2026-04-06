'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SeoFieldsProps {
  metaTitle: string
  metaDescription: string
  metaTitleEn?: string
  metaDescriptionEn?: string
  canonicalUrl: string
  slug: string
  onMetaTitleChange: (value: string) => void
  onMetaDescriptionChange: (value: string) => void
  onMetaTitleEnChange?: (value: string) => void
  onMetaDescriptionEnChange?: (value: string) => void
  onCanonicalUrlChange: (value: string) => void
}

export function SeoFields({
  metaTitle,
  metaDescription,
  metaTitleEn = '',
  metaDescriptionEn = '',
  canonicalUrl,
  slug,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onMetaTitleEnChange,
  onMetaDescriptionEnChange,
  onCanonicalUrlChange,
}: SeoFieldsProps) {
  const titleLen = metaTitle.length
  const descLen = metaDescription.length
  const titleEnLen = metaTitleEn.length
  const descEnLen = metaDescriptionEn.length

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-small">عنوان متا</Label>
        <Input value={metaTitle} onChange={(e) => onMetaTitleChange(e.target.value)} placeholder="عنوان در نتایج جستجو" />
        <p className="text-caption text-muted-foreground">{titleLen.toLocaleString('fa-IR')}/۶۰ نویسه پیشنهادی</p>
      </div>

      <div>
        <Label className="text-small">توضیحات متا</Label>
        <Textarea
          rows={3}
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          placeholder="خلاصه کوتاه برای نتایج جستجو"
        />
        <p className="text-caption text-muted-foreground">{descLen.toLocaleString('fa-IR')}/۱۶۰ نویسه پیشنهادی</p>
      </div>

      {onMetaTitleEnChange && (
        <div>
          <Label className="text-small">عنوان متا انگلیسی</Label>
          <Input
            value={metaTitleEn}
            onChange={(e) => onMetaTitleEnChange(e.target.value)}
            placeholder="English title for search results"
          />
          <p className="text-caption text-muted-foreground">{titleEnLen.toLocaleString('fa-IR')}/۶۰ نویسه پیشنهادی</p>
        </div>
      )}

      {onMetaDescriptionEnChange && (
        <div>
          <Label className="text-small">توضیحات متا انگلیسی</Label>
          <Textarea
            rows={3}
            value={metaDescriptionEn}
            onChange={(e) => onMetaDescriptionEnChange(e.target.value)}
            placeholder="English description for search results"
          />
          <p className="text-caption text-muted-foreground">{descEnLen.toLocaleString('fa-IR')}/۱۶۰ نویسه پیشنهادی</p>
        </div>
      )}

      <div>
        <Label className="text-small">آدرس مرجع</Label>
        <Input
          value={canonicalUrl}
          onChange={(e) => onCanonicalUrlChange(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="rounded-[var(--radius-md)] border border-border p-3">
        <p className="text-small text-info">پیش‌نمایش نتیجه جستجو</p>
        <p className="mt-2 text-sm text-primary line-clamp-1">{metaTitle || 'عنوان نتیجه جستجو'}</p>
        <p className="text-caption text-success">voiceiran.ir/{slug || '...'}</p>
        <p className="mt-1 text-small text-muted-foreground line-clamp-2">
          {metaDescription || 'توضیحات متا برای این محتوا در این بخش نمایش داده می‌شود.'}
        </p>
      </div>
    </div>
  )
}
