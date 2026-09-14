"use client";

import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

export default function BlogGrid() {
  const { t, href } = useLanguage();

  const blogPosts = [
    {
      id: 1,
      title: t("blog.posts.1.title"),
      excerpt: t("blog.posts.1.excerpt"),
      author: t("blog.posts.1.author"),
      date: t("blog.posts.1.date"),
      readTime: t("blog.posts.1.readTime"),
      category: t("blog.posts.1.category"),
      image: "/images/blog-1.jpg"
    },
    {
      id: 2,
      title: t("blog.posts.2.title"),
      excerpt: t("blog.posts.2.excerpt"),
      author: t("blog.posts.2.author"),
      date: t("blog.posts.2.date"),
      readTime: t("blog.posts.2.readTime"),
      category: t("blog.posts.2.category"),
      image: "/images/blog-2.jpg"
    },
    {
      id: 3,
      title: t("blog.posts.3.title"),
      excerpt: t("blog.posts.3.excerpt"),
      author: t("blog.posts.3.author"),
      date: t("blog.posts.3.date"),
      readTime: t("blog.posts.3.readTime"),
      category: t("blog.posts.3.category"),
      image: "/images/blog-3.jpg"
    },
    {
      id: 4,
      title: t("blog.posts.4.title"),
      excerpt: t("blog.posts.4.excerpt"),
      author: t("blog.posts.4.author"),
      date: t("blog.posts.4.date"),
      readTime: t("blog.posts.4.readTime"),
      category: t("blog.posts.4.category"),
      image: "/images/blog-4.jpg"
    },
    {
      id: 5,
      title: t("blog.posts.5.title"),
      excerpt: t("blog.posts.5.excerpt"),
      author: t("blog.posts.5.author"),
      date: t("blog.posts.5.date"),
      readTime: t("blog.posts.5.readTime"),
      category: t("blog.posts.5.category"),
      image: "/images/blog-5.jpg"
    },
    {
      id: 6,
      title: t("blog.posts.6.title"),
      excerpt: t("blog.posts.6.excerpt"),
      author: t("blog.posts.6.author"),
      date: t("blog.posts.6.date"),
      readTime: t("blog.posts.6.readTime"),
      category: t("blog.posts.6.category"),
      image: "/images/blog-6.jpg"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            href={href(`/blog/${post.id}`)}
            className="group bg-white border border-line rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue/20 transition-all duration-300"
          >
            <div className="relative h-[200px] sm:h-[240px] bg-gradient-to-br from-goldSoft to-peach overflow-hidden">
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-semibold text-blue">
                {post.category}
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue to-blueDeep flex items-center justify-center">
                    <span className="text-white font-serif font-bold text-xl">B</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-4 text-[11.5px] text-muted mb-3">
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
              
              <h3 className="font-serif text-[17px] sm:text-[18px] font-semibold text-ink mb-3 line-clamp-2 group-hover:text-blue transition-colors">
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
          </Link>
        ))}
      </div>
    </section>
  );
}