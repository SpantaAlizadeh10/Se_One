"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const courseCovers: Record<string, string> = {
  beginners: "/images/kids.jpeg",
  everyday: "/images/clas.jpeg",
  advanced: "/images/c1.jpeg",
  ielts: "/images/ielts.jpeg",
};

export default function RelatedCourses({ excludeId }: { excludeId: string }) {
  const { t, href } = useLanguage();
  const r = t("courseReviews");
  const courses: { id: string; title: string; level: string }[] =
    t("coursesData");
  const related = courses.filter((c) => c.id !== excludeId).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-[17px] font-semibold mb-4">{r.relatedHeading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((course) => (
          <Link
            key={course.id}
            href={href(`/courses/${course.id}`)}
            className="bg-white border border-line rounded-lg overflow-hidden shadow-card hover:-translate-y-1 hover:shadow-cardHover transition-all block"
          >
            <div className="relative h-[90px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${courseCovers[course.id] ?? courseCovers.beginners}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen
                  size={30}
                  className="text-white/90"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="p-3.5">
              <div className="text-[13px] font-semibold mb-0.5 line-clamp-1">
                {course.title}
              </div>
              <div className="text-[11px] text-muted">{course.level}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
