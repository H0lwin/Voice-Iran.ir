import type {Metadata} from 'next'
import Image from 'next/image'
import {notFound} from 'next/navigation'
import {AppShell} from '@/components/organisms/AppShell'
import {getPostDetail} from '@/lib/api'
import {formatDateByLocale, formatNumberByLocale} from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}): Promise<Metadata> {
  const {locale, slug} = await params
  const post = await getPostDetail(locale, slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt || post.summary || '',
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{locale: 'fa' | 'en'; slug: string}>
}) {
  const {locale, slug} = await params
  const post = await getPostDetail(locale, slug)
  if (!post) notFound()

  return (
    <AppShell showBack headerTitle={locale === 'fa' ? 'جزئیات خبر' : 'News Detail'} hideNav>
      <article className="px-4 pt-4 pb-10 max-w-4xl mx-auto w-full">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
          <Image src={post.image || '/images/placeholder-media.svg'} alt={post.title} fill className="object-cover" />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {(post.categories || []).map((category) => (
            <span key={category.slug} className="px-2 py-1 rounded-full text-xs bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
              {category.label}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{post.title}</h1>
        <div className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-3 mb-4">
          {post.published_at ? <span>{formatDateByLocale(post.published_at, locale)}</span> : null}
          {typeof post.views === 'number' ? <span>{formatNumberByLocale(post.views, locale)}</span> : null}
          {typeof post.reading_time === 'number' ? (
            <span>
              {formatNumberByLocale(post.reading_time, locale)} {locale === 'fa' ? 'دقیقه' : 'min'}
            </span>
          ) : null}
        </div>
        {post.summary ? <p className="text-[var(--color-text-secondary)] mb-4">{post.summary}</p> : null}
        {post.content ? (
          <div
            className="prose prose-invert max-w-none prose-p:text-[var(--color-text-secondary)]"
            dangerouslySetInnerHTML={{__html: post.content}}
          />
        ) : (
          <p className="text-[var(--color-text-secondary)]">{post.excerpt || ''}</p>
        )}
      </article>
    </AppShell>
  )
}
