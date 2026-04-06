import type {Metadata} from "next"
import {HomePageClient} from "@/components/pages/HomePageClient"
import {getHomePageData, type HomePagePayload} from "@/lib/api"

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: "fa" | "en"}>
}): Promise<Metadata> {
  const {locale} = await params
  const home = await getHomePageData(locale)
  const title = home?.hero.title || (locale === "en" ? "Voice of Iran" : "صدای ایران")
  const description =
    home?.hero.description ||
    (locale === "en"
      ? "Documented narratives of martyrs, news, weapons, and archive collections."
      : "روایت مستند از شهدا، اخبار، تسلیحات و آرشیو اسناد.")

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {fa: "/fa", en: "/en"},
    },
  }
}

export default async function HomePage({params}: {params: Promise<{locale: "fa" | "en"}>}) {
  const {locale} = await params
  const data = (await getHomePageData(locale)) || buildFallback(locale)

  return <HomePageClient locale={locale} data={data} />
}

function buildFallback(locale: "fa" | "en"): HomePagePayload {
  const isEn = locale === "en"
  return {
    hero: {
      live_badge: isEn ? "LIVE" : "زنده",
      title: isEn ? "Voice of Iran" : "صدای ایران",
      description: isEn
        ? "Documented narratives of martyrs, news, weapons, and archive collections."
        : "روایت مستند از شهدا، اخبار، تسلیحات و آرشیو اسناد.",
      primary_action_label: isEn ? "Watch Report" : "تماشای گزارش",
      secondary_action_label: isEn ? "Learn More" : "اطلاعات بیشتر",
      background_image: "/images/placeholder-media.svg",
    },
    quick_access: {items: []},
    live_stats: {title: isEn ? "Live Stats" : "آمار لحظه‌ای", items: []},
    common: {empty_label: isEn ? "No items are available." : "موردی برای نمایش وجود ندارد."},
    sections: {
      latest_news: {title: isEn ? "Latest News" : "آخرین اخبار", view_all_label: isEn ? "View all" : "مشاهده همه", items: []},
      latest_achievements: {
        title: isEn ? "Latest Achievements" : "آخرین دستاوردها",
        view_all_label: isEn ? "View all" : "مشاهده همه",
        items: [],
      },
      featured_weapons: {
        title: isEn ? "Featured Weapons" : "تسلیحات ویژه",
        view_all_label: isEn ? "View all" : "مشاهده همه",
        item: null,
      },
      featured_documents: {title: isEn ? "Featured Documents" : "مستندات ویژه", view_all_label: isEn ? "View all" : "مشاهده همه", items: []},
      featured_martyrs: {
        title: isEn ? "Featured Martyrs" : "شهدای ویژه",
        view_all_label: isEn ? "View all" : "مشاهده همه",
        quote: isEn
          ? '"Do not consider those slain in God\'s way as dead; they are alive."'
          : "«و لا تحسبن الذین قتلوا فی سبیل الله امواتا بل احیاء»",
        items: [],
      },
    },
  }
}
