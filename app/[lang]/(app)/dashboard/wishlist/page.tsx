"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, BookOpen, X } from "lucide-react";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getWishlist, removeFromWishlist, type WishlistItem } from "@/lib/api/wishlist";
import { useCourses } from "@/lib/use-courses";

const gradients: Record<string, string> = {
  beginners: "from-[#CFE7E4] to-[#9FCFC9]",
  everyday: "from-[#D9D2F0] to-[#B7A8E6]",
  advanced: "from-[#CDE0D6] to-[#9CC4AC]",
  ielts: "from-[#F4D9C6] to-[#E8AE85]"
};

export default function WishlistPage() {
  const { t, href, lang } = useLanguage();
  const w = t("wishlist");
  const { courses } = useCourses(lang);
  const [savedItems, setSavedItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    getWishlist().then(setSavedItems).catch(() => setSavedItems([]));
  }, []);

  const remove = async (id: string) => {
    try {
      await removeFromWishlist(id);
      setSavedItems((items) => items.filter((item) => item.courseId !== id));
    } catch {
      // Keep the item visible if the API request fails.
    }
  };

  const savedCourses = savedItems.map((item) => ({
    id: item.courseId,
    title: courses.find((course) => course.id === item.courseId)?.title || item.courseTitle,
    level: courses.find((course) => course.id === item.courseId)?.level || "",
    price: item.coursePrice,
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[24px] sm:text-[27px] font-semibold mb-1">{w.pageHeading}</h2>
      </div>

      {savedCourses.length === 0 ? (
        <div className="bg-white border border-line rounded-lg shadow-card p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-cream text-muted flex items-center justify-center mx-auto mb-4">
            <Heart size={24} />
          </div>
          <p className="text-ink70 text-[14px] mb-5">{w.empty}</p>
          <Link
            href={href("/courses")}
            className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3 rounded-full text-[13.5px] font-semibold hover:bg-blueDeep transition-colors"
          >
            {w.browseCourses}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {savedCourses.map((course) => {
            return (
              <div key={course.id} className="bg-white border border-line rounded-lg overflow-hidden shadow-card">
                <div className={`h-[110px] relative bg-gradient-to-br ${gradients[course.id] ?? gradients.beginners} flex items-center justify-center`}>
                  <BookOpen size={36} className="text-white/90" strokeWidth={1.5} />
                  <button
                    onClick={() => remove(course.id)}
                    aria-label={w.remove}
                    className="absolute top-2.5 end-2.5 w-8 h-8 rounded-full bg-white/90 text-danger flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-[14.5px] font-semibold mb-1">{course.title}</h3>
                  <div className="text-[12px] text-muted mb-3">{course.level}</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-ink">{course.price}</span>
                    <Link href={href(`/courses/${course.id}`)} className="text-[12px] font-semibold text-blue">
                      {w.viewCourse}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
