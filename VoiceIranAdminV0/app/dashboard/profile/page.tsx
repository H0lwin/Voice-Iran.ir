'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store/auth-store'
import { toast } from 'sonner'

type ProfileForm = {
  firstName: string
  lastName: string
  email: string
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { register, handleSubmit, reset } = useForm<ProfileForm>()

  useEffect(() => {
    if (!user) return
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
  }, [user, reset])

  const onSubmit = handleSubmit((values) => {
    if (!user) return
    const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim()
    useAuthStore.setState({
      user: {
        ...user,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        fullName: fullName || user.fullName,
        email: values.email.trim(),
      },
    })
    toast.success('پروفایل به‌روز شد (فقط در این مرورگر)')
  })

  if (!user) {
    return null
  }

  const initial = user.fullName?.trim()?.charAt(0) || 'U'

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1>پروفایل</h1>
        <p className="text-muted-foreground">اطلاعات نمایشی حساب شما</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-16 rounded-[var(--radius-md)]">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback className="text-lg">{initial}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{user.fullName}</CardTitle>
            <Badge variant="outline" className="mt-2">
              {user.role.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fn">نام</Label>
                <Input id="fn" {...register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ln">نام خانوادگی</Label>
                <Input id="ln" {...register('lastName')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="em">ایمیل</Label>
              <Input id="em" type="email" dir="ltr" className="text-left" {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label>نام کاربری</Label>
              <Input value={user.username} disabled dir="ltr" className="text-left" />
            </div>
            <Button type="submit">ذخیره</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
