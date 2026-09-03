"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // close the mobile drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* dim background behind the drawer on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <main className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 pb-16 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
