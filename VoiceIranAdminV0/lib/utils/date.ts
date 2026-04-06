// Date utilities with Jalali calendar support
import { format, formatDistanceToNow } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { newDate } from 'date-fns-jalali'
import { format as formatGregorian } from 'date-fns'

// Format date to Jalali
export function formatJalaliDate(date: string | Date, formatStr = 'yyyy/MM/dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatStr, { locale: faIR })
}

// Convert Persian/Arabic digits to English digits
export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (char) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(char))).replace(/[٠-٩]/g, (char) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(char)))
}

// Convert Jalali date input (e.g. 1405/01/17) to Gregorian yyyy-MM-dd
export function jalaliToGregorianDate(input: string): string {
  const normalized = toEnglishDigits(input).trim().replace(/\./g, '/').replace(/-/g, '/')
  const parts = normalized.split('/').map((part) => part.trim()).filter(Boolean)
  if (parts.length !== 3) return ''
  const [yearRaw, monthRaw, dayRaw] = parts
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return ''
  if (month < 1 || month > 12 || day < 1 || day > 31) return ''
  const gregorianDate = newDate(year, month - 1, day)
  return formatGregorian(gregorianDate, 'yyyy-MM-dd')
}

// Format date with time
export function formatJalaliDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'yyyy/MM/dd - HH:mm', { locale: faIR })
}

// Format relative time (e.g., "۳ روز پیش")
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: faIR })
}

// Format to Persian numerals
export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

// Format number with Persian locale (adds thousand separators)
export function formatPersianNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num)
}

// Format file size
export function formatFileSize(bytes: number): string {
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  let unitIndex = 0
  let size = bytes

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${formatPersianNumber(Math.round(size * 10) / 10)} ${units[unitIndex]}`
}

// Format duration in seconds to readable format
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes === 0) {
    return `${toPersianNumber(remainingSeconds)} ثانیه`
  }
  
  if (remainingSeconds === 0) {
    return `${toPersianNumber(minutes)} دقیقه`
  }
  
  return `${toPersianNumber(minutes)} دقیقه و ${toPersianNumber(remainingSeconds)} ثانیه`
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${toPersianNumber(Math.round(value))}٪`
}

// Get Jalali month name
export function getJalaliMonthName(month: number): string {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد',
    'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر',
    'دی', 'بهمن', 'اسفند'
  ]
  return months[month - 1] || ''
}

// Get Jalali weekday name
export function getJalaliWeekdayName(day: number): string {
  const weekdays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
  return weekdays[day] || ''
}
