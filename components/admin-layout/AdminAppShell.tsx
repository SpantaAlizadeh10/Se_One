"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin-layout/AdminSidebar";
import AdminTopbar from "@/components/admin-layout/AdminTopbar";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import DailyProverb from "@/components/shared/DailyProverb";
import DashboardMobileNav from "@/components/shared/DashboardMobileNav";

export default function AdminAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { href } = useLanguage();

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated (except for login page itself).
    if (!isLoading && !isAuthenticated && !pathname.includes("/admin-login")) {
      router.replace(href("/admin-login"));
    }
  }, [isLoading, isAuthenticated, pathname, router, href]);

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

  // Prevent flash during SSR
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen flex lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      )}

      <main className="w-full flex-1 min-w-0 max-w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-7 pb-28 lg:pb-16 max-lg:overflow-x-clip">
        <AdminTopbar
          onMenuClick={() => setSidebarOpen((open) => !open)}
          isMenuOpen={sidebarOpen}
        />
        <div className="w-full min-w-0 max-w-full">{children}</div>
        <DailyProverb />
      </main>
      {!sidebarOpen && <DashboardMobileNav role="admin" />}
    </div>
  );
}
