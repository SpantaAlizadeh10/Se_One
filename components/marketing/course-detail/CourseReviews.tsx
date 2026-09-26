"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getCourseReviews, getCourseRatingSummary, type Review, type CourseRatingSummary } from "@/lib/api/reviews";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<CourseRatingSummary | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getCourseReviews(courseId), getCourseRatingSummary(courseId)])
      .then(([items, rating]) => {
        if (active) {
          setReviews(items);
          setSummary(rating);
        }
      })
      .catch(() => {
        if (active) {
          setReviews([]);
          setSummary(null);
        }
      });
    return () => { active = false; };
  }, [courseId]);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="text-[17px] font-semibold m-0">{r.heading}</h2>
        <div className="flex items-center gap-2">
          <Stars rating={summary?.averageRating ?? 0} />
          <span className="text-[13px] text-ink70">
            {summary?.averageRating ?? 0} · {r.basedOn} {summary?.totalReviews ?? reviews.length} {r.reviewsWord}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-line rounded-lg shadow-card p-4">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <span className="text-[13.5px] font-semibold">{rev.userName}</span>
              <Stars rating={rev.rating} size={12} />
            </div>
            <p className="text-[13px] text-ink70 leading-relaxed m-0">{rev.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
