"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { courseReviews, getAverageRating } from "@/lib/course-reviews";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(rating) ? "text-gold" : "text-line"} fill={n <= Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export default function CourseReviews({ courseId }: { courseId: string }) {
  const { t } = useLanguage();
  const r = t("courseReviews");
  const reviews = courseReviews[courseId] ?? [];
  const { average, count } = getAverageRating(courseId);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="text-[17px] font-semibold m-0">{r.heading}</h2>
        <div className="flex items-center gap-2">
          <Stars rating={average} />
          <span className="text-[13px] text-ink70">
            {average} · {r.basedOn} {count} {r.reviewsWord}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-line rounded-lg shadow-card p-4">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <span className="text-[13.5px] font-semibold">{rev.name}</span>
              <Stars rating={rev.rating} size={12} />
            </div>
            <p className="text-[13px] text-ink70 leading-relaxed m-0">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
