"use client";

import { useState } from "react";
import { Clock, CheckCircle2, Award } from "lucide-react";
import { assignments, type Assignment } from "@/lib/data";

const filters = ["All", "Pending", "Submitted", "Graded"] as const;

const statusStyles: Record<Assignment["status"], { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-[#FDEFE0]", text: "text-[#B8792E]", label: "Pending" },
  submitted: { bg: "bg-[#E4ECFF]", text: "text-blue", label: "Submitted" },
  graded: { bg: "bg-sage", text: "text-sageDeep", label: "Graded" }
};

export default function AssignmentsTable() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const visible =
    filter === "All"
      ? assignments
      : assignments.filter((a) => a.status === filter.toLowerCase());

  const pendingCount = assignments.filter((a) => a.status === "pending").length;
  const submittedCount = assignments.filter((a) => a.status === "submitted").length;
  const gradedScores = assignments
    .filter((a) => a.grade)
    .map((a) => Number(a.grade!.split("/")[0]));
  const avg = Math.round(gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 mb-6" style={{ gap: 18 }}>
        <div className="bg-white border border-line rounded-md p-4.5 shadow-card flex items-center gap-3.5" style={{ padding: "18px 20px" }}>
          <div className="w-[42px] h-[42px] rounded-[11px] bg-[#FDEFE0] text-[#B8792E] flex items-center justify-center shrink-0">
            <Clock size={19} />
          </div>
          <div>
            <div className="font-serif text-[24px] font-semibold leading-none">{pendingCount}</div>
            <div className="text-[12px] text-muted mt-1">Pending assignments</div>
          </div>
        </div>
        <div className="bg-white border border-line rounded-md p-4.5 shadow-card flex items-center gap-3.5" style={{ padding: "18px 20px" }}>
          <div className="w-[42px] h-[42px] rounded-[11px] bg-[#E4ECFF] text-blue flex items-center justify-center shrink-0">
            <CheckCircle2 size={19} />
          </div>
          <div>
            <div className="font-serif text-[24px] font-semibold leading-none">{submittedCount}</div>
            <div className="text-[12px] text-muted mt-1">Awaiting review</div>
          </div>
        </div>
        <div className="bg-white border border-line rounded-md p-4.5 shadow-card flex items-center gap-3.5" style={{ padding: "18px 20px" }}>
          <div className="w-[42px] h-[42px] rounded-[11px] bg-sage text-sageDeep flex items-center justify-center shrink-0">
            <Award size={19} />
          </div>
          <div>
            <div className="font-serif text-[24px] font-semibold leading-none">{avg}%</div>
            <div className="text-[12px] text-muted mt-1">Average grade</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4.5 py-2.5 rounded-full text-[13px] font-semibold border ${
              filter === f ? "bg-ink text-white border-ink" : "bg-white text-ink70 border-line"
            }`}
            style={{ padding: "9px 17px" }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-cream border-b border-line">
              {["Assignment", "Due date", "Status", "Grade", ""].map((h) => (
                <th
                  key={h}
                  className="text-start text-[11px] font-bold tracking-wider uppercase text-muted px-5 py-3.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => {
              const s = statusStyles[a.status];
              return (
                <tr key={a.id} className="border-b border-line last:border-none hover:bg-gold/5">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[13.5px]">{a.title}</div>
                    <div className="text-[12px] text-muted mt-0.5">{a.course}</div>
                  </td>
                  <td className="px-5 py-4 text-[13.5px]">{a.due}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex text-[11.5px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13.5px] font-bold">{a.grade ?? "—"}</td>
                  <td className="px-5 py-4">
                    <a href="#" className="text-[12.5px] font-bold text-blue">
                      {a.status === "pending" ? "Submit" : "View"}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
