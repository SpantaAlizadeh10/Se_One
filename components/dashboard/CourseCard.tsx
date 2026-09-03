import { BookOpen } from "lucide-react";
import type { Course } from "@/lib/data";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-line shadow-card hover:shadow-cardHover hover:-translate-y-1 transition-all">
      <div className={`h-[140px] relative flex items-center justify-center bg-gradient-to-br ${course.gradient}`}>
        <span className="absolute top-3 start-3 bg-white/90 text-sageDeep text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
          In Progress
        </span>
        {course.price && (
          <span className="absolute top-3 end-3 bg-gold text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            {course.price}
          </span>
        )}
        <BookOpen size={56} className="text-white/90" strokeWidth={1.5} />
      </div>
      <div className="px-[18px] pt-4 pb-[18px]">
        <h3 className="text-[15.5px] font-semibold mb-0.5">{course.title}</h3>
        <div className="text-[12px] text-muted mb-3">{course.level}</div>
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-[7px] bg-line rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue to-blueDeep"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <div className="text-[12px] font-bold min-w-[32px] text-end">{course.progress}%</div>
        </div>
      </div>
    </div>
  );
}
