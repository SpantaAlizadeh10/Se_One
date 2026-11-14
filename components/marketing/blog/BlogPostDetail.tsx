"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { getBlogPost, type BlogPost } from "@/lib/api/blog";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const allowedTags = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "EM",
  "H2",
  "H3",
  "I",
  "LI",
  "OL",
  "P",
  "PRE",
  "STRONG",
  "U",
  "UL",
]);

function sanitizeArticleHtml(html: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelectorAll("script,style,iframe,object,embed,svg,math").forEach(
    (element) => element.remove(),
  );
  parsed.body.querySelectorAll("*").forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    const href =
      element.tagName === "A" ? element.getAttribute("href")?.trim() : null;
    const isRelative =
      Boolean(href) && href!.startsWith("/") && !href!.startsWith("//");
    const isAllowedLink =
      Boolean(href) &&
      (isRelative || /^(https?:|mailto:|tel:)/i.test(href!));

    [...element.attributes].forEach((attribute) => {
      if (element.tagName !== "A" || attribute.name !== "href" || !isAllowedLink) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === "A" && isAllowedLink && href) {
      if (/^https?:/i.test(href)) {
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      }
    }
  });
  return parsed.body.innerHTML;
}

export default function BlogPostDetail({ postId }: { postId: string }) {
  const { lang, href } = useLanguage();
  const fa = lang === "fa";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getBlogPost(postId, lang)
      .then((loaded) => {
        if (active) setPost(loaded);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(
          reason instanceof ApiError && reason.status === 404
            ? fa
              ? "این مقاله پیدا نشد یا هنوز منتشر نشده است."
              : "This article was not found or is not published."
            : reason instanceof Error
              ? reason.message
              : fa
                ? "بارگذاری مقاله با مشکل روبه‌رو شد."
                : "Could not load this article.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fa, lang, postId]);

  const backLink = (
    <Link
      href={href("/blog")}
      className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue"
    >
      {fa ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
      {fa ? "بازگشت به وبلاگ" : "Back to blog"}
    </Link>
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        {backLink}
        <p className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-muted">
          {fa ? "مقاله در حال بارگذاری است…" : "Loading article…"}
        </p>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        {backLink}
        <p
          role="alert"
          className="rounded-2xl border border-danger/20 bg-white p-8 text-center text-sm text-danger"
        >
          {error || (fa ? "مقاله پیدا نشد." : "Article not found.")}
        </p>
      </main>
    );
  }

  const safeContent = post.content ? sanitizeArticleHtml(post.content) : "";

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      {backLink}
      <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {post.image && (
          <div
            role="img"
            aria-label={post.title}
            className="h-56 bg-cover bg-center sm:h-96"
            style={{
              backgroundImage: `linear-gradient(180deg, transparent 55%, rgba(12,18,28,0.28)), url("${post.image.replace(/["\\\n\r]/g, "")}")`,
            }}
          />
        )}
        <div className="p-5 sm:p-9">
          {post.category && (
            <span className="mb-3 inline-flex rounded-full bg-blue/10 px-3 py-1 text-[11px] font-semibold text-blue">
              {post.category}
            </span>
          )}
          <h1 className="mb-5 font-serif text-2xl font-semibold leading-snug sm:text-4xl">
            {post.title}
          </h1>
          <div className="mb-7 flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-5 text-xs text-muted">
            {post.author && (
              <span className="inline-flex items-center gap-1.5">
                <User size={14} /> {post.author}
              </span>
            )}
            {post.date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> {post.date}
              </span>
            )}
            {post.readTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} /> {post.readTime}
              </span>
            )}
          </div>
          <div
            className="prose prose-sm max-w-none text-ink70 sm:prose-base [&_a]:text-blue [&_a]:underline [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:font-semibold [&_li]:my-1 [&_p]:leading-8"
            dir={fa ? "rtl" : "ltr"}
          >
            {safeContent ? (
              <div dangerouslySetInnerHTML={{ __html: safeContent }} />
            ) : (
              <p>{post.excerpt}</p>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
