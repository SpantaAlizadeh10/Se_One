"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TeacherSidebar from "@/components/teacher-layout/TeacherSidebar";
import TeacherTopbar from "@/components/teacher-layout/TeacherTopbar";
import { CallProvider } from "@/components/calls/CallProvider";
import DailyProverb from "@/components/shared/DailyProverb";
import DashboardMobileNav from "@/components/shared/DashboardMobileNav";

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

        <main className="w-full min-w-0 max-w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-7 pb-28 lg:pb-16 max-lg:overflow-x-clip">
          <TeacherTopbar
            onMenuClick={() => setSidebarOpen((open) => !open)}
            isMenuOpen={sidebarOpen}
          />
          <div className="w-full min-w-0 max-w-full">{children}</div>
          <DailyProverb />
        </main>
      </div>
      {!sidebarOpen && <DashboardMobileNav role="teacher" />}
    </CallProvider>
  );
}
