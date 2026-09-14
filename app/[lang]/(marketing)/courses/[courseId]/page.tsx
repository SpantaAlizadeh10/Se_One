"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Users,
  Check,
  Tag,
  Heart,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useCoursesPricing } from "@/lib/use-courses-pricing";
import { useCourses } from "@/lib/use-courses";
import type { Course } from "@/lib/api/courses";
import { getDiscountedPrice, formatPrice } from "@/lib/courses-pricing";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist-store";
import CourseReviews from "@/components/marketing/course-detail/CourseReviews";
import RelatedCourses from "@/components/marketing/course-detail/RelatedCourses";

const gradients: Record<string, string> = {
  beginners: "from-[#CFE7E4] to-[#9FCFC9]",
  everyday: "from-[#D9D2F0] to-[#B7A8E6]",
  advanced: "from-[#CDE0D6] to-[#9CC4AC]",
  ielts: "from-[#F4D9C6] to-[#E8AE85]",
};

const courseCoverImages: Record<string, string> = {
  beginners: "/images/kids.jpeg",
  everyday: "/images/clas.jpeg",
  advanced: "/images/c1.jpeg",
  ielts: "/images/ielts.jpeg",
};

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { t, href, lang } = useLanguage();
  const c = t("courseDetail");
  const fallbackCourses: Course[] = t("coursesData");
  const { courses, loading } = useCourses(lang, fallbackCourses);
  const [pricing] = useCoursesPricing();

  const course = courses.find((cc) => cc.id === params.courseId);
  if (!course && loading) {
    return (
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center text-ink70">
        Loading course...
      </main>
    );
  }
  if (!course) notFound();

  const p = pricing.find((cp) => cp.id === course.id);
  const hasDiscount = !!p && p.discountPercent > 0;
  const discountedPrice = p
    ? getDiscountedPrice(p.basePrice, p.discountPercent)
    : null;

  const learnItems: string[] = c.whatYouLearnItems;
  const includesItems: string[] = c.includesItems;

  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(isWishlisted(course.id));
  }, [course.id]);

  return (
    <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <Link
        href={href("/courses")}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink70 mb-6"
      >
        <ArrowLeft size={14} className="rtl:rotate-180" />
        {c.backToCourses}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
        <div>
          <div className="relative h-[180px] sm:h-[220px] rounded-lg overflow-hidden mb-6">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(12,18,28,0.18), rgba(12,18,28,0.14)), url(${course.image ?? courseCoverImages[course.id] ?? courseCoverImages.beginners})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen size={64} className="text-white/90" strokeWidth={1.4} />
            </div>
          </div>

          <span className="inline-block bg-sage text-sageDeep text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
            {course.level}
          </span>
          <h1 className="font-serif text-[26px] sm:text-[30px] font-semibold mb-3">
            {course.title}
          </h1>
          <p className="text-ink70 text-[14.5px] leading-relaxed mb-5">
            {course.desc}
          </p>

          <div className="flex items-center gap-4 text-[13px] text-ink70 mb-8">
            <span className="flex items-center gap-1.5">
              <BookOpen size={15} /> {course.lessons} {t("common.lessons")}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={15} /> {course.students} {t("common.students")}
            </span>
          </div>

          <h2 className="text-[17px] font-semibold mb-3.5">{c.whatYouLearn}</h2>
          <ul className="flex flex-col gap-2.5 mb-8">
            {learnItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13.5px] text-ink70"
              >
                <Check size={16} className="text-sageDeep shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-line rounded-lg shadow-card p-6 lg:sticky lg:top-24">
          <div className="text-[12px] text-muted mb-1.5">{c.priceLabel}</div>
          {hasDiscount ? (
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[26px] font-serif font-semibold text-goldDeep">
                {formatPrice(discountedPrice!, lang)}
              </span>
              <span className="text-[15px] text-muted line-through">
                {formatPrice(p!.basePrice, lang)}
              </span>
            </div>
          ) : (
            <div className="text-[26px] font-serif font-semibold mb-1">
              {course.price}
            </div>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 bg-danger/10 text-danger text-[11px] font-bold px-2.5 py-1 rounded-full mb-4">
              <Tag size={11} /> -{p!.discountPercent}%
            </span>
          )}

          <Link
            href={href(`/checkout/${course.id}`)}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue text-white rounded-full py-3.5 text-[14px] font-semibold hover:bg-blueDeep transition-colors mt-3"
          >
            {c.enrollNow} <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>

          <button
            onClick={() =>
              setSaved(toggleWishlist(course.id).includes(course.id))
            }
            className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-semibold mt-2.5 border transition-colors ${
              saved
                ? "border-danger/30 text-danger bg-danger/5"
                : "border-line text-ink70 hover:border-ink"
            }`}
          >
            <Heart size={15} fill={saved ? "currentColor" : "none"} />
            {saved ? t("wishlist.saved") : t("wishlist.save")}
          </button>

          <div className="border-t border-line my-5" />

          <div className="text-[13px] font-semibold mb-3">{c.includes}</div>
          <ul className="flex flex-col gap-2">
            {includesItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[12.5px] text-ink70"
              >
                <Check size={14} className="text-blue shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CourseReviews courseId={course.id} />
      <RelatedCourses excludeId={course.id} />
    </main>
  );
}
