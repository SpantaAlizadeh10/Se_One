"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useBlogPosts } from "@/lib/use-blog-posts";
import type { BlogPost } from "@/lib/api/blog";

function sortNewestFirst(posts: BlogPost[]): BlogPost[] {
  return posts
    .map((post, index) => ({ post, index, timestamp: Date.parse(post.date) }))
    .sort((a, b) => {
      const aValid = Number.isFinite(a.timestamp);
      const bValid = Number.isFinite(b.timestamp);
      if (aValid && bValid) return b.timestamp - a.timestamp || a.index - b.index;
      if (aValid) return -1;
      if (bValid) return 1;
      return a.index - b.index;
    })
    .map(({ post }) => post);
}

export default function HomeLatestArticles() {
  const { t, href, lang, dir } = useLanguage();
  const fallbackPosts = useMemo<BlogPost[]>(
    () =>
      [1, 2, 3].map((id) => ({
        id,
        title: t(`blog.posts.${id}.title`),
        excerpt: t(`blog.posts.${id}.excerpt`),
        author: t(`blog.posts.${id}.author`),
        date: t(`blog.posts.${id}.date`),
        readTime: t(`blog.posts.${id}.readTime`),
        category: t(`blog.posts.${id}.category`),
        image: [
          "/images/Study4.jpeg",
          "/images/Calender.jpeg",
          "/images/free-discussion.jpeg",
        ][id - 1],
      })),
    [t],
  );
  const loadedPosts = useBlogPosts(lang, fallbackPosts);
  const latestPosts = useMemo(
    () => sortNewestFirst(loadedPosts).slice(0, 3),
    [loadedPosts],
  );

  const postHref = (post: BlogPost) =>
    post.sourceUrl || href(`/blog/${post.slug || post.id}`);
  const title = t("home.articles.heading");

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-goldDeep">
            {t("home.articles.eyebrow")}
          </p>
          <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink70">
            {t("home.articles.description")}
          </p>
        </div>
        <Link
          href={href("/blog")}
          className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold text-blue transition-colors hover:border-blue/40 hover:bg-blue/5 sm:inline-flex"
        >
          {t("home.articles.viewAll")}
          <ArrowRight size={16} className="rtl:rotate-180" />
        </Link>
      </div>

      <div
        dir={dir}
        role="region"
        aria-label={title}
        tabIndex={0}
        className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
      >
        {latestPosts.map((post) => {
          const content = (
            <>
              <div className="relative h-48 overflow-hidden bg-cream">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(180deg, transparent 48%, rgba(12,18,28,0.3)), url("${post.image.replace(/["\\\n\r]/g, "")}")`,
                  }}
                />
                {post.category && (
                  <span className="absolute start-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue shadow-sm">
                    {post.category}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-muted">
                  <CalendarDays size={14} aria-hidden="true" />
                  <time>{post.date}</time>
                  {post.readTime && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{post.readTime}</span>
                    </>
                  )}
                </div>
                <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-blue">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink70">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue">
                  <BookOpen size={15} aria-hidden="true" />
                  {t("blog.readMore")}
                  <ArrowRight size={15} className="rtl:rotate-180" />
                </span>
              </div>
            </>
          );
          const className =
            "group flex h-full w-[86%] min-w-0 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:border-blue/30 hover:shadow-cardHover sm:w-auto";

          return post.sourceUrl ? (
            <a
              key={post.id}
              href={postHref(post)}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {content}
            </a>
          ) : (
            <Link key={post.id} href={postHref(post)} className={className}>
              {content}
            </Link>
          );
        })}
      </div>

      <Link
        href={href("/blog")}
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold text-blue transition-colors hover:border-blue/40 hover:bg-blue/5 sm:hidden"
      >
        {t("home.articles.viewAll")}
        <ArrowRight size={16} className="rtl:rotate-180" />
      </Link>
    </section>
  );
}
