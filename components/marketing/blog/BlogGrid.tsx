"use client";

import { Calendar, Clock, ArrowRight, User, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useBlogPosts } from "@/lib/use-blog-posts";
import type { BlogPost } from "@/lib/api/blog";

export default function BlogGrid() {
  const { t, href, lang } = useLanguage();

  const fallbackPosts: BlogPost[] = [
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
  ];
  const blogPosts = useBlogPosts(lang, fallbackPosts);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {blogPosts.map((post, index) => (
          <a
            key={post.id}
            href={post.sourceUrl || href(`/blog/${post.id}`)}
            target={post.sourceUrl ? "_blank" : undefined}
            rel={post.sourceUrl ? "noreferrer" : undefined}
            className={`group bg-white border border-line rounded-2xl overflow-hidden shadow-card hover:-translate-y-1 hover:shadow-cardHover hover:border-blue/20 transition-all duration-300 ${index === 0 ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5"}`}
          >
            <div
              className={`relative overflow-hidden bg-cream ${index === 0 ? "h-[260px] sm:h-[360px]" : "h-[190px] sm:h-[220px]"}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(12,18,28,0.12), rgba(12,18,28,0.28)), url('${post.image}')`,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
              <div className="absolute start-4 top-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-semibold text-blue">
                {post.category}
              </div>
              <div className="absolute start-4 bottom-4 inline-flex items-center gap-2 text-white text-[12px] font-semibold">
                <BookOpen size={14} />{" "}
                {post.source === "cambridge"
                  ? "Cambridge University Press"
                  : "SE ONE Journal"}
              </div>
            </div>

            <div className={`${index === 0 ? "p-5 sm:p-7" : "p-5"}`}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted mb-3">
                <div className="flex items-center gap-1.5">
                  <User size={13} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>{post.readTime}</span>
                </div>
              </div>

              <h3
                className={`font-serif font-semibold text-ink mb-3 line-clamp-2 group-hover:text-blue transition-colors ${index === 0 ? "text-[22px] sm:text-[26px]" : "text-[17px] sm:text-[18px]"}`}
              >
                {post.title}
              </h3>

              <p className="text-[13px] text-ink70 leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-2 text-blue text-[13px] font-semibold group-hover:gap-3 transition-all">
                {t("blog.readMore")}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
