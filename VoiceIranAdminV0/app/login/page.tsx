'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { useAuthStore } from '@/lib/store/auth-store'
import { authApi } from '@/lib/api/api-client'
import { Checkbox } from '@/components/ui/checkbox'

const loginSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
  rememberMe: z.boolean().default(false),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/dashboard'
  const { login, isLoading, isAuthenticated, isHydrated, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showAuthError, setShowAuthError] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockSeconds, setLockSeconds] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  useEffect(() => {
    if (lockSeconds <= 0) return
    const timer = setInterval(() => {
      setLockSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [lockSeconds])

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isHydrated, router])

  const onSubmit = async (data: LoginFormData) => {
    if (lockSeconds > 0) return
    clearError()
    setShowAuthError(false)

    try {
      await authApi.getCsrfToken()
      await login({ username: data.username.trim(), password: data.password, rememberMe: data.rememberMe })
      setFailedAttempts(0)
      router.replace(nextPath)
    } catch {
      const nextFailed = failedAttempts + 1
      setFailedAttempts(nextFailed)
      if (nextFailed >= 3) {
        setLockSeconds(5)
        setFailedAttempts(0)
      }
      setShowAuthError(true)
    }
  }

  if (isHydrated && isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(30,58,95,0.08),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.06),transparent_45%)] px-4 py-8">
      <div className="w-[calc(100%-32px)] max-w-[400px]">
        <Card className="border-border bg-card/95">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Shield className="size-7" />
            </div>
            <CardTitle className="text-xl">پنل مدیریت VoiceIran</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {showAuthError && (
                <div className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-small text-destructive">
                  نام کاربری یا رمز عبور اشتباه است
                </div>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">نام کاربری</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="نام کاربری را وارد کنید"
                    dir="ltr"
                    className="text-left"
                    {...register('username')}
                  />
                  {errors.username && <p className="text-caption text-destructive">{errors.username.message}</p>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="رمز عبور را وارد کنید"
                      className="pe-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label="نمایش/عدم نمایش رمز"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-caption text-destructive">{errors.password.message}</p>}
                </Field>
              </FieldGroup>

              <label className="flex items-center gap-2 text-small">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setValue('rememberMe', Boolean(checked))}
                />
                مرا به خاطر بسپار
              </label>

              <Button type="submit" className="w-full" disabled={isLoading || lockSeconds > 0}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    در حال ورود...
                  </span>
                ) : lockSeconds > 0 ? (
                  <span className="flex items-center gap-2">تلاش مجدد تا {lockSeconds.toLocaleString('fa-IR')} ثانیه دیگر</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="size-4" />
                    ورود به سیستم
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
