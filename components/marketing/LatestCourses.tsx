"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Users, Tag, Heart } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCoursesPricing } from "@/lib/use-courses-pricing";
import { getDiscountedPrice, formatPrice } from "@/lib/courses-pricing";
import { getWishlist, toggleWishlist } from "@/lib/wishlist-store";
import { useCourses } from "@/lib/use-courses";
import type { Course } from "@/lib/api/courses";

const gradients = [
  "from-[#CFE7E4] to-[#9FCFC9]",
  "from-[#D9D2F0] to-[#B7A8E6]",
  "from-[#CDE0D6] to-[#9CC4AC]",
  "from-[#F4D9C6] to-[#E8AE85]",
];

const courseCovers: Record<string, string> = {
  beginners: "/images/kids.jpeg",
  everyday: "/images/clas.jpeg",
  advanced: "/images/c1.jpeg",
  ielts: "/images/ielts.jpeg",
  "german-a1": "/images/A1.jpeg",
  "german-a2": "/images/A2.jpeg",
  "german-b1": "/images/B1.jpeg",
  "free-discussion": "/images/free-discussion.jpeg",
};

type Variant = "latest" | "popular" | "popular-cta";

export default function LatestCourses({
  variant = "latest",
  filterQuery,
}: {
  variant?: Variant;
  filterQuery?: string;
}) {
  const { t, href, lang } = useLanguage();
  const [pricing] = useCoursesPricing();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setWishlist(getWishlist());
  }, []);

  const handleWishlistClick = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(toggleWishlist(courseId));
  };

  const fallbackCourses: Course[] = t("coursesData");
  const { courses: allCourses } = useCourses(lang, fallbackCourses);

  const q = filterQuery?.trim().toLowerCase() ?? "";
  const courses = q
    ? allCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.level.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q),
      )
    : allCourses;

  const heading =
    variant === "latest"
      ? t("home.courses.heading")
      : t("coursesPage.popular.heading");
  const subtitle = variant === "latest" ? t("home.courses.sub") : null;
  const topButtonLabel = variant === "latest" ? t("common.getStarted") : null;
  const bottomButtonLabel =
    variant === "popular-cta" ? t("coursesPage.popular.signUp") : null;
  const sectionId = variant === "popular" ? undefined : "courses";

  return (
    <section
      id={sectionId}
      className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16"
    >
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold mb-2 relative inline-block after:content-[''] after:absolute after:start-0 after:-bottom-2 after:w-16 after:h-[3px] after:bg-gold after:rounded">
            {heading}
          </h2>
          {subtitle && (
            <p className="text-ink70 text-[14px] max-w-[440px] mt-3">
              {subtitle}
            </p>
          )}
        </div>
        {topButtonLabel && (
          <button className="inline-flex items-center gap-2 bg-blue text-white px-5 py-3 rounded-full text-[13.5px] font-semibold hover:bg-blueDeep transition-colors shrink-0">
            {topButtonLabel} <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <p className="text-center text-ink70 text-[14px] py-10">
          {t("common.noCoursesFound")}
        </p>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
          {courses.map((course, i) => (
            <Link
              key={course.id}
              href={href(`/courses/${course.id}`)}
              className="min-w-0 bg-white border border-line rounded-lg overflow-hidden shadow-card hover:-translate-y-1 hover:shadow-cardHover transition-all block"
            >
              <div className="relative h-[130px] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(12,18,28,0.14), rgba(12,18,28,0.1)), url(${course.image ?? courseCovers[course.id] ?? courseCovers.beginners})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/15" />
                <span className="absolute top-3 start-3 bg-white/90 text-sageDeep text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full z-10">
                  {course.level}
                </span>
                <button
                  onClick={(e) => handleWishlistClick(e, course.id)}
                  aria-label={t("wishlist.save")}
                  className="absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart
                    size={15}
                    className={
                      wishlist.includes(course.id)
                        ? "text-danger"
                        : "text-ink70"
                    }
                    fill={
                      wishlist.includes(course.id) ? "currentColor" : "none"
                    }
                  />
                </button>
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <BookOpen
                    size={44}
                    className="text-white/90"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="min-h-[2.75rem] text-[13px] sm:text-[14.5px] leading-[1.45] font-semibold mb-1.5 line-clamp-2">
                  {course.title}
                </h3>
                <p className="min-h-[3.5rem] text-[11px] sm:text-[12px] text-muted leading-relaxed mb-3 line-clamp-2">
                  {course.desc}
                </p>
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10px] sm:text-[11px] text-muted mb-3">
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} /> {course.lessons}{" "}
                    {t("common.lessons")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {course.students} {t("common.students")}
                  </span>
                </div>
                {(() => {
                  const p = pricing.find((cp) => cp.id === course.id);
                  if (p && p.discountPercent > 0) {
                    const discounted = getDiscountedPrice(
                      p.basePrice,
                      p.discountPercent,
                    );
                    return (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-danger/10 text-danger text-[11px] font-bold px-2.5 py-1 rounded-full">
                          <Tag size={11} /> -{p.discountPercent}%
                        </span>
                        <span className="text-[11px] text-muted line-through">
                          {formatPrice(p.basePrice, lang)}
                        </span>
                        <span className="inline-block bg-goldSoft text-goldDeep text-[12px] font-bold px-3 py-1 rounded-full">
                          {formatPrice(discounted, lang)}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <span className="inline-block bg-goldSoft text-goldDeep text-[12px] font-bold px-3 py-1 rounded-full">
                      {course.price}
                    </span>
                  );
                })()}
              </div>
            </Link>
          ))}
        </div>
      )}

      {bottomButtonLabel && (
        <div className="text-center mt-8">
          <Link
            href={href("/signup")}
            className="inline-flex items-center gap-2 bg-gold text-white px-8 py-3.5 rounded-full text-[14px] font-semibold hover:bg-goldDeep transition-colors"
          >
            {bottomButtonLabel}
          </Link>
        </div>
      )}
    </section>
  );
}
