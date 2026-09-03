"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin-layout/AdminSidebar";
import AdminTopbar from "@/components/admin-layout/AdminTopbar";

export default function AdminAppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-ink/40 lg:hidden" aria-hidden="true" />
      )}

      <main className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 pb-16 min-w-0">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
