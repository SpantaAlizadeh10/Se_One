"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Trash2, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { teacherDirectory, type TeacherProfile } from "@/lib/teachers-directory";

export default function AdminTeachersPage() {
  const { t } = useLanguage();
  const s = t("adminTeachersPage");

  const [teachers, setTeachers] = useState<TeacherProfile[]>(teacherDirectory);
  const [query, setQuery] = useState("");

  const filtered = teachers.filter(
    (tc) => tc.name.toLowerCase().includes(query.toLowerCase()) || tc.subject.toLowerCase().includes(query.toLowerCase())
  );

  const remove = (id: string) => {
    if (!window.confirm(s.confirmDelete)) return;
    // In production this would call DELETE /api/admin/teachers/:id first.
    setTeachers((prev) => prev.filter((tc) => tc.id !== id));
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 bg-white border border-line rounded-full px-4 py-2.5 shadow-card max-w-[320px] mb-6">
        <Search size={16} className="text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={s.searchPlaceholder}
          className="flex-1 min-w-0 outline-none text-[13.5px] placeholder:text-muted bg-transparent"
        />
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-cream border-b border-line">
              {[s.colName, s.colSubject, s.colLevel, s.colRating, s.colActions].map((h) => (
                <th key={h} className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tc) => (
              <tr key={tc.id} className="border-b border-line last:border-none hover:bg-cream/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Image src={tc.avatar} alt={tc.name} width={34} height={34} className="rounded-full object-cover shrink-0" />
                    <span className="text-[13.5px] font-semibold">{tc.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">{tc.subject}</td>
                <td className="px-5 py-3.5 text-[13px] text-ink70">{tc.level}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink70">
                    <Star size={13} className="text-gold" fill="currentColor" />
                    {tc.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => remove(tc.id)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-danger bg-danger/10 hover:bg-danger/15 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Trash2 size={13} />
                    {s.deleteBtn}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13.5px] text-muted">
                  {s.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
