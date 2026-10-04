"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TeacherSidebar from "@/components/teacher-layout/TeacherSidebar";
import TeacherTopbar from "@/components/teacher-layout/TeacherTopbar";
import { CallProvider } from "@/components/calls/CallProvider";
import DailyProverb from "@/components/shared/DailyProverb";

export default function TeacherAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [sidebarOpen]);

  return (
    <CallProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
        <TeacherSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          />
        )}

        <main className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 pb-16 min-w-0">
          <TeacherTopbar onMenuClick={() => setSidebarOpen(true)} />
          {children}
          <DailyProverb />
        </main>
      </div>
    </CallProvider>
  );
}
