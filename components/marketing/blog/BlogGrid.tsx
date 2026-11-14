"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Search,
  User,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useBlogPosts } from "@/lib/use-blog-posts";
import type { BlogPost } from "@/lib/api/blog";

function getPublishedTime(date: string): number | null {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function sortNewestFirst(posts: BlogPost[]): BlogPost[] {
  return posts
    .map((post, index) => ({ post, index, timestamp: getPublishedTime(post.date) }))
    .sort((a, b) => {
      if (a.timestamp !== null && b.timestamp !== null) {
        return b.timestamp - a.timestamp || a.index - b.index;
      }
      if (a.timestamp !== null) return -1;
      if (b.timestamp !== null) return 1;
      return a.index - b.index;
    })
    .map(({ post }) => post);
}

export default function BlogGrid() {
  const { t, href, lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const fallbackPosts = useMemo<BlogPost[]>(
    () => [
    {
      id: 1,
      title: t("blog.posts.1.title"),
      excerpt: t("blog.posts.1.excerpt"),
      author: t("blog.posts.1.author"),
      date: t("blog.posts.1.date"),
      readTime: t("blog.posts.1.readTime"),
      category: t("blog.posts.1.category"),
      image: "/images/Study4.jpeg",
    },
    {
      id: 2,
      title: t("blog.posts.2.title"),
      excerpt: t("blog.posts.2.excerpt"),
      author: t("blog.posts.2.author"),
      date: t("blog.posts.2.date"),
      readTime: t("blog.posts.2.readTime"),
      category: t("blog.posts.2.category"),
      image: "/images/Calender.jpeg",
    },
    {
      id: 3,
      title: t("blog.posts.3.title"),
      excerpt: t("blog.posts.3.excerpt"),
      author: t("blog.posts.3.author"),
      date: t("blog.posts.3.date"),
      readTime: t("blog.posts.3.readTime"),
      category: t("blog.posts.3.category"),
      image: "/images/free-discussion.jpeg",
    },
    {
      id: 4,
      title: t("blog.posts.4.title"),
      excerpt: t("blog.posts.4.excerpt"),
      author: t("blog.posts.4.author"),
      date: t("blog.posts.4.date"),
      readTime: t("blog.posts.4.readTime"),
      category: t("blog.posts.4.category"),
      image: "/images/c1.jpeg",
    },
    {
      id: 5,
      title: t("blog.posts.5.title"),
      excerpt: t("blog.posts.5.excerpt"),
      author: t("blog.posts.5.author"),
      date: t("blog.posts.5.date"),
      readTime: t("blog.posts.5.readTime"),
      category: t("blog.posts.5.category"),
      image: "/images/A1.jpeg",
    },
    {
      id: 6,
      title: t("blog.posts.6.title"),
      excerpt: t("blog.posts.6.excerpt"),
      author: t("blog.posts.6.author"),
      date: t("blog.posts.6.date"),
      readTime: t("blog.posts.6.readTime"),
      category: t("blog.posts.6.category"),
      image: "/images/ielts.jpeg",
    },
    ],
    [lang, t],
  );

  const loadedPosts = useBlogPosts(lang, fallbackPosts);
  const posts = useMemo(() => sortNewestFirst(loadedPosts), [loadedPosts]);
  const categories = useMemo(
    () => [...new Set(posts.map((post) => post.category).filter(Boolean))],
    [posts],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase(lang);
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      !activeCategory || post.category === activeCategory;
    const searchableText = [
      post.title,
      post.excerpt,
      post.author,
      post.category,
    ]
      .join(" ")
      .toLocaleLowerCase(lang);
    return matchesCategory && searchableText.includes(normalizedQuery);
  });
  const featuredPost =
    !query.trim() && !activeCategory ? filteredPosts[0] : undefined;
  const remainingPosts = featuredPost
    ? filteredPosts.slice(1)
    : filteredPosts;

  const postHref = (post: BlogPost) =>
    post.sourceUrl || href(`/blog/${post.slug || post.id}`);

  const metadata = (post: BlogPost) => {
    const publishedTime = getPublishedTime(post.date);
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        {post.author && (
          <span className="inline-flex items-center gap-1.5">
            <User size={14} aria-hidden="true" />
            {post.author}
          </span>
        )}
        {post.date && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} aria-hidden="true" />
            <time
              dateTime={
                publishedTime === null
                  ? undefined
                  : new Date(publishedTime).toISOString()
              }
            >
              {post.date}
            </time>
          </span>
        )}
        {post.readTime && (
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" />
            {post.readTime}
          </span>
        )}
      </div>
    );
  };

  const sourceLabel = (post: BlogPost) =>
    post.source === "cambridge" ? "Cambridge University Press" : "SE ONE Journal";

  return (
    <section
      className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 sm:pb-16"
      aria-label={lang === "fa" ? "مقاله‌های وبلاگ" : "Blog articles"}
    >
      <div className="mb-7 flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-goldDeep">
            {lang === "fa" ? "مجلهٔ SE ONE" : "THE SE ONE JOURNAL"}
          </p>
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            {lang === "fa" ? "تازه‌ترین مقاله‌ها" : "Latest stories"}
          </h2>
        </div>
        <label className="flex min-h-11 w-full items-center gap-2 rounded-full border border-line bg-white px-4 shadow-sm focus-within:border-blue md:max-w-sm">
          <Search size={17} className="shrink-0 text-muted" aria-hidden="true" />
          <span className="sr-only">
            {lang === "fa" ? "جست‌وجو در مقاله‌ها" : "Search articles"}
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              lang === "fa" ? "جست‌وجو در مقاله‌ها..." : "Search articles..."
            }
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div
        className="mb-8 flex gap-2 overflow-x-auto pb-2"
        aria-label={lang === "fa" ? "دسته‌بندی مقاله‌ها" : "Article categories"}
      >
        {["", ...categories].map((category) => {
          const selected = activeCategory === category;
          return (
            <button
              key={category || "all"}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={selected}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                selected
                  ? "border-blue bg-blue text-white"
                  : "border-line bg-white text-ink70 hover:border-blue hover:text-blue"
              }`}
            >
              {category ||
                (lang === "fa" ? "همهٔ مقاله‌ها" : "All articles")}
            </button>
          );
        })}
      </div>

      {featuredPost && (
        <a
          href={postHref(featuredPost)}
          target={featuredPost.sourceUrl ? "_blank" : undefined}
          rel={featuredPost.sourceUrl ? "noopener noreferrer" : undefined}
          className="group mb-10 grid overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover md:grid-cols-2"
        >
          <div className="relative min-h-[230px] overflow-hidden bg-cream sm:min-h-[320px] md:min-h-[390px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent 55%, rgba(12,18,28,0.42)), url("${featuredPost.image.replace(/["\\\n\r]/g, "")}")`,
              }}
            />
            <span className="absolute start-5 top-5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue shadow-sm">
              {lang === "fa" ? "پیشنهاد سردبیر" : "Editor’s pick"}
            </span>
            <span className="absolute bottom-5 start-5 inline-flex items-center gap-2 text-xs font-semibold text-white">
              <BookOpen size={15} aria-hidden="true" />
              {sourceLabel(featuredPost)}
            </span>
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
            {featuredPost.category && (
              <span className="mb-4 w-fit rounded-full bg-blue/10 px-3 py-1 text-xs font-bold text-blue">
                {featuredPost.category}
              </span>
            )}
            {metadata(featuredPost)}
            <h3 className="mt-4 font-serif text-2xl font-semibold leading-snug text-ink transition-colors group-hover:text-blue sm:text-3xl">
              {featuredPost.title}
            </h3>
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-ink70 sm:text-base">
              {featuredPost.excerpt}
            </p>
            <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-blue">
              {t("blog.readMore")}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </span>
          </div>
        </a>
      )}

      {remainingPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {remainingPosts.map((post) => (
            <a
              key={post.id}
              href={postHref(post)}
              target={post.sourceUrl ? "_blank" : undefined}
              rel={post.sourceUrl ? "noopener noreferrer" : undefined}
              className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:border-blue/30 hover:shadow-cardHover"
            >
              <div className="relative h-52 overflow-hidden bg-cream">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(180deg, transparent 50%, rgba(12,18,28,0.38)), url("${post.image.replace(/["\\\n\r]/g, "")}")`,
                  }}
                />
                <span className="absolute start-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue">
                  {post.category}
                </span>
                <span className="absolute bottom-4 start-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white">
                  <BookOpen size={13} aria-hidden="true" />
                  {sourceLabel(post)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                {metadata(post)}
                <h3 className="mt-3 line-clamp-2 font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-blue">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink70">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue">
                  {t("blog.readMore")}
                  <ArrowRight size={15} className="rtl:rotate-180" />
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p
          role="status"
          className="rounded-2xl border border-dashed border-line bg-white px-5 py-12 text-center text-sm text-muted"
        >
          {lang === "fa"
            ? "مقاله‌ای با این عبارت یا در این دسته‌بندی پیدا نشد."
            : "No articles match this search or category."}
        </p>
      )}
    </section>
  );
}
