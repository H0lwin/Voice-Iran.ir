'use client'

import { useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Pilcrow,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { mediaApi } from '@/lib/api/api-client'
import { toast } from 'sonner'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'محتوای خود را اینجا بنویسید...',
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    // جلوگیری از ناسازگاری هیدرات Next.js با رندر فوری ادیتور (Tiptap v2)
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image.configure({ HTMLAttributes: { class: 'rounded-[var(--radius-md)] max-w-full' } }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'right' }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => onChange?.(currentEditor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[300px] p-4 focus:outline-none [direction:rtl]',
          'prose prose-sm max-w-none dark:prose-invert sm:prose-base',
        ),
      },
    },
  })

  if (!editor) return null

  return (
    <div className={cn('rounded-[var(--radius-lg)] border border-border bg-background', className)}>
      <EditorToolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  )
}

function EditorToolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [openInNewTab, setOpenInNewTab] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [lastUploadedImageUrl, setLastUploadedImageUrl] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const setParagraph = () => editor.chain().focus().setParagraph().run()
  const setLink = () => {
    if (!linkUrl.trim()) return
    editor
      .chain()
      .focus()
      .setLink({ href: linkUrl, target: openInNewTab ? '_blank' : null })
      .run()
    setLinkUrl('')
  }

  const setImage = () => {
    if (!imageUrl.trim()) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setIsUploadingImage(true)
    try {
      const src = await mediaApi.uploadImage(file)
      editor.chain().focus().setImage({ src }).run()
      setLastUploadedImageUrl(src)
      toast.success('تصویر در متن به‌صورت تصویر (تگ img) درج شد')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'آپلود تصویر ناموفق بود')
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <div className="sticky top-20 z-[120] flex max-w-full items-center gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2">
      <Toggle
        size="sm"
        pressed={editor.isActive('paragraph')}
        onPressedChange={setParagraph}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <Pilcrow className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <Heading1 className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <Heading2 className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <Heading3 className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <Bold className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <Italic className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <List className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <ListOrdered className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={disabled}>
            <LinkIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>آدرس لینک</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="open-new-tab">باز شدن در تب جدید</Label>
              <Switch id="open-new-tab" checked={openInNewTab} onCheckedChange={setOpenInNewTab} />
            </div>
            <Button size="sm" onClick={setLink}>
              افزودن لینک
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={disabled}>
            <ImageIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>آدرس تصویر (URL)</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." dir="ltr" className="text-left" />
            </div>
            <Button className="w-full" size="sm" onClick={setImage}>
              درج تصویر از لینک
            </Button>
            <p className="text-caption text-muted-foreground leading-relaxed">
              محتوای ذخیره‌شده شامل تگ تصویر است؛ در ویرایشگر پیش‌نمایش تصویر دیده می‌شود.
            </p>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">یا</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="block text-center text-xs text-muted-foreground">
                آپلود از دستگاه (در محتوای HTML به‌صورت تگ تصویر ذخیره می‌شود)
              </Label>
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={disabled || isUploadingImage}
                onChange={(e) => void handleImageUpload(e)}
              />
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                disabled={disabled || isUploadingImage}
                onClick={() => imageFileInputRef.current?.click()}
              >
                {isUploadingImage ? 'در حال آپلود…' : 'انتخاب فایل و درج در متن'}
              </Button>
              {lastUploadedImageUrl && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">لینک تصویر آپلودشده</Label>
                  <Input value={lastUploadedImageUrl} readOnly dir="ltr" className="text-left text-xs" />
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <AlignRight className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <AlignCenter className="size-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        disabled={disabled}
        className="data-[state=on]:bg-[#E2E8F0] dark:data-[state=on]:bg-[#1E293B]"
      >
        <AlignLeft className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button variant="ghost" size="icon-sm" onClick={() => editor.chain().focus().undo().run()} disabled={disabled || !editor.can().undo()}>
        <Undo className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => editor.chain().focus().redo().run()} disabled={disabled || !editor.can().redo()}>
        <Redo className="size-4" />
      </Button>
    </div>
  )
}
