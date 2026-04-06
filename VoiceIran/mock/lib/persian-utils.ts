import jalaali from 'jalaali-js'

// Persian month names
export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
]

// Persian weekday names
export const PERSIAN_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه'
]

// Convert English digits to Persian
export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

// Convert Persian digits to English
export function toEnglishDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)))
}

// Format number with Persian digits and thousand separators
export function formatPersianNumber(num: number): string {
  const formatted = num.toLocaleString('fa-IR')
  return formatted
}

// Convert Gregorian date to Jalali (Solar Hijri)
export function toJalali(date: Date): { jy: number; jm: number; jd: number } {
  return jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
}

// Format date in Persian
export function formatPersianDate(date: Date, format: 'full' | 'short' | 'numeric' = 'full'): string {
  const jalali = toJalali(date)
  
  switch (format) {
    case 'full':
      return `${toPersianDigits(jalali.jd)} ${PERSIAN_MONTHS[jalali.jm - 1]} ${toPersianDigits(jalali.jy)}`
    case 'short':
      return `${toPersianDigits(jalali.jd)} ${PERSIAN_MONTHS[jalali.jm - 1]}`
    case 'numeric':
      return `${toPersianDigits(jalali.jy)}/${toPersianDigits(jalali.jm.toString().padStart(2, '0'))}/${toPersianDigits(jalali.jd.toString().padStart(2, '0'))}`
    default:
      return `${toPersianDigits(jalali.jd)} ${PERSIAN_MONTHS[jalali.jm - 1]} ${toPersianDigits(jalali.jy)}`
  }
}

// Get current Jalali date
export function getCurrentJalaliDate(): { jy: number; jm: number; jd: number } {
  return toJalali(new Date())
}

// Format reading time in Persian
export function formatReadingTime(minutes: number): string {
  return `${toPersianDigits(minutes)} دقیقه مطالعه`
}

// Format relative time in Persian
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'لحظاتی پیش'
  } else if (minutes < 60) {
    return `${toPersianDigits(minutes)} دقیقه پیش`
  } else if (hours < 24) {
    return `${toPersianDigits(hours)} ساعت پیش`
  } else if (days < 7) {
    return `${toPersianDigits(days)} روز پیش`
  } else {
    return formatPersianDate(date, 'full')
  }
}

// Truncate text with Persian ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Get Persian weekday name
export function persianWeekDay(date: Date): string {
  const dayIndex = date.getDay()
  return PERSIAN_WEEKDAYS[dayIndex]
}

// Alias for formatPersianDate (full format)
export function toPersianDate(date: Date): string {
  return formatPersianDate(date, 'full')
}

// Alias for toPersianDigits
export function toPersianNumber(num: number | string): string {
  return toPersianDigits(num)
}
