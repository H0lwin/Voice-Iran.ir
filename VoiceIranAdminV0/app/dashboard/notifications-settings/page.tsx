'use client'

import { useMemo, useState } from 'react'
import { BellRing, Clock3, Send, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { usePermission } from '@/lib/auth/use-permission'
import { toast } from 'sonner'

type Channel = 'in_app' | 'email' | 'sms' | 'push'
type Priority = 'low' | 'normal' | 'high'

const channelLabels: Record<Channel, string> = {
  in_app: 'داخل سامانه',
  email: 'ایمیل',
  sms: 'پیامک',
  push: 'پوش نوتیفیکیشن',
}

export default function NotificationsSettingsPage() {
  const { hasPermission } = usePermission('notifications')
  const [activeTab, setActiveTab] = useState('send')
  const [saving, setSaving] = useState(false)

  const [sendForm, setSendForm] = useState({
    title: '',
    body: '',
    channels: ['in_app'] as Channel[],
    priority: 'normal' as Priority,
    recipients: '',
    sendToAll: false,
    scheduledAt: '',
  })

  const [templateForm, setTemplateForm] = useState({
    code: '',
    titleTemplate: '',
    bodyTemplate: '',
    channel: 'in_app' as Channel,
    isActive: true,
  })

  const recipientsCount = useMemo(() => {
    if (sendForm.sendToAll) return 'همه کاربران'
    const count = sendForm.recipients
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean).length
    return `${count.toLocaleString('fa-IR')} کاربر`
  }, [sendForm.recipients, sendForm.sendToAll])

  const toggleChannel = (channel: Channel, checked: boolean) => {
    setSendForm((prev) => {
      if (checked) {
        if (prev.channels.includes(channel)) return prev
        return { ...prev, channels: [...prev.channels, channel] }
      }
      return { ...prev, channels: prev.channels.filter((ch) => ch !== channel) }
    })
  }

  const submitNotification = async () => {
    if (!sendForm.title.trim() || !sendForm.body.trim()) {
      toast.error('عنوان و متن اعلان الزامی هستند')
      return
    }
    if (sendForm.channels.length === 0) {
      toast.error('حداقل یک کانال ارسال انتخاب کنید')
      return
    }
    if (!sendForm.sendToAll && !sendForm.recipients.trim()) {
      toast.error('حداقل یک گیرنده وارد کنید یا ارسال به همه را فعال کنید')
      return
    }

    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success(sendForm.scheduledAt ? 'اعلان زمان‌بندی شد' : 'اعلان با موفقیت ارسال شد')
      setSendForm((prev) => ({
        ...prev,
        title: '',
        body: '',
        recipients: '',
        scheduledAt: '',
      }))
    }, 500)
  }

  const saveTemplate = async () => {
    if (!templateForm.code.trim() || !templateForm.titleTemplate.trim() || !templateForm.bodyTemplate.trim()) {
      toast.error('کد قالب، عنوان و متن قالب الزامی هستند')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('قالب اعلان ذخیره شد')
    }, 500)
  }

  if (!hasPermission) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border p-8 text-center text-muted-foreground">
        دسترسی به مدیریت اعلان برای نقش شما فعال نیست.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>اعلان‌ها</h1>
        <p className="text-muted-foreground">ارسال اعلان و مدیریت قالب‌های اعلان</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="send">ارسال اعلان</TabsTrigger>
          <TabsTrigger value="templates">قالب‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BellRing className="size-4" />
                فرم ارسال اعلان
              </CardTitle>
              <CardDescription>ارسال فوری یا زمان‌بندی‌شده به کاربران هدف</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان</Label>
                <Input value={sendForm.title} onChange={(e) => setSendForm((prev) => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>متن اعلان</Label>
                <Textarea rows={4} value={sendForm.body} onChange={(e) => setSendForm((prev) => ({ ...prev, body: e.target.value }))} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>اولویت</Label>
                  <Select value={sendForm.priority} onValueChange={(value: Priority) => setSendForm((prev) => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">عادی</SelectItem>
                      <SelectItem value="normal">متوسط</SelectItem>
                      <SelectItem value="high">فوری</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>زمان‌بندی ارسال</Label>
                  <div className="relative">
                    <Clock3 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      value={sendForm.scheduledAt}
                      onChange={(e) => setSendForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                      className="pe-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>کانال‌ها</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(channelLabels) as Channel[]).map((channel) => (
                    <label key={channel} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border p-2 text-small">
                      <Checkbox
                        checked={sendForm.channels.includes(channel)}
                        onCheckedChange={(checked) => toggleChannel(channel, Boolean(checked))}
                      />
                      {channelLabels[channel]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-all">ارسال به همه کاربران</Label>
                  <Switch
                    id="send-all"
                    checked={sendForm.sendToAll}
                    onCheckedChange={(checked) => setSendForm((prev) => ({ ...prev, sendToAll: checked }))}
                  />
                </div>
                <Input
                  disabled={sendForm.sendToAll}
                  placeholder="نام‌کاربری‌ها را با کاما جدا کنید: admin,editor1"
                  value={sendForm.recipients}
                  onChange={(e) => setSendForm((prev) => ({ ...prev, recipients: e.target.value }))}
                  dir="ltr"
                  className="text-left"
                />
                <p className="text-caption text-muted-foreground">گیرندگان: {recipientsCount}</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => void submitNotification()} disabled={saving}>
                  <Send className="me-2 size-4" />
                  {saving ? 'در حال پردازش…' : sendForm.scheduledAt ? 'ثبت زمان‌بندی' : 'ارسال اعلان'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <WandSparkles className="size-4" />
                قالب اعلان
              </CardTitle>
              <CardDescription>
                استفاده از متغیرهای پویا مثل <span dir="ltr">{'{{user_name}}'}</span> و{' '}
                <span dir="ltr">{'{{content_title}}'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>کد قالب</Label>
                <Input
                  value={templateForm.code}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      code: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                    }))
                  }
                  dir="ltr"
                  className="text-left"
                  placeholder="content_review_requested"
                />
              </div>
              <div className="space-y-2">
                <Label>عنوان قالب</Label>
                <Input
                  value={templateForm.titleTemplate}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, titleTemplate: e.target.value }))}
                  placeholder="محتوای {{content_title}} نیاز به بررسی دارد"
                />
              </div>
              <div className="space-y-2">
                <Label>متن قالب</Label>
                <Textarea
                  rows={5}
                  value={templateForm.bodyTemplate}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, bodyTemplate: e.target.value }))}
                  placeholder="کاربر {{user_name}} یک محتوای جدید برای بررسی ارسال کرد."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>کانال پیش‌فرض</Label>
                  <Select
                    value={templateForm.channel}
                    onValueChange={(value: Channel) => setTemplateForm((prev) => ({ ...prev, channel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(channelLabels) as Channel[]).map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channelLabels[channel]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3 py-2">
                  <Label htmlFor="template-active">فعال</Label>
                  <Switch
                    id="template-active"
                    checked={templateForm.isActive}
                    onCheckedChange={(checked) => setTemplateForm((prev) => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => void saveTemplate()} disabled={saving}>
                  {saving ? 'در حال ذخیره…' : 'ذخیره قالب'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
