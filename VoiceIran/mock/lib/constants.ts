// Navigation items for the header
export const NAV_ITEMS = [
  { label: 'اخبار', href: '/news' },
  { label: 'دستاوردها', href: '/achievements' },
  { label: 'شهدا', href: '/martyrs' },
  { label: 'تحلیل‌ها', href: '/analysis' },
  { label: 'مستندات', href: '/documents' },
]

// Quick links for footer
export const QUICK_LINKS = [
  { label: 'صفحه اصلی', href: '/' },
  { label: 'آخرین اخبار', href: '/news' },
  { label: 'دستاوردهای اخیر', href: '/achievements' },
  { label: 'یاد شهدا', href: '/martyrs' },
  { label: 'تحلیل‌های برگزیده', href: '/analysis' },
]

// Site sections for footer
export const SITE_SECTIONS = [
  { label: 'آرشیو مستندات', href: '/documents' },
  { label: 'آرشیو تصاویر', href: '/documents?type=photos' },
  { label: 'آرشیو ویدئو', href: '/documents?type=videos' },
  { label: 'جستجوی پیشرفته', href: '/search' },
  { label: 'درباره ما', href: '/about' },
]

// News categories
export const NEWS_CATEGORIES = [
  { id: 'all', label: 'همه', color: 'gold' },
  { id: 'political', label: 'سیاسی', color: 'blue' },
  { id: 'military', label: 'نظامی', color: 'emerald' },
  { id: 'technology', label: 'فناوری', color: 'gold' },
  { id: 'regional', label: 'منطقه‌ای', color: 'crimson' },
]

// Achievement verification badges
export const VERIFICATION_BADGES = {
  official: { label: 'رسمی', color: 'emerald' },
  documented: { label: 'مستند', color: 'blue' },
  claimed: { label: 'ادعایی', color: 'amber' },
}

// Target types for achievements
export const TARGET_TYPES = {
  drone: { label: 'پهپاد', icon: 'drone' },
  missile: { label: 'موشک', icon: 'missile' },
  aircraft: { label: 'هواپیما', icon: 'aircraft' },
  ship: { label: 'کشتی', icon: 'ship' },
  ground: { label: 'زمینی', icon: 'ground' },
}

// Iranian provinces
export const PROVINCES = [
  'تهران',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'آذربایجان شرقی',
  'آذربایجان غربی',
  'مازندران',
  'گیلان',
  'کرمان',
  'خوزستان',
  'سیستان و بلوچستان',
  'کردستان',
  'هرمزگان',
  'یزد',
  'قم',
  'البرز',
  'قزوین',
  'مرکزی',
  'همدان',
  'لرستان',
  'کرمانشاه',
  'گلستان',
  'سمنان',
  'اردبیل',
  'بوشهر',
  'چهارمحال و بختیاری',
  'زنجان',
  'ایلام',
  'کهگیلویه و بویراحمد',
  'خراسان شمالی',
  'خراسان جنوبی',
]

// Site info
export const SITE_INFO = {
  name: 'سامانه اطلاع‌رسانی دفاعی',
  shortName: 'سامانه دفاعی',
  description: 'سامانه رسمی اطلاع‌رسانی دفاعی جمهوری اسلامی ایران',
  copyright: 'کلیه حقوق متعلق به جمهوری اسلامی ایران',
  version: '۱.۰',
}
