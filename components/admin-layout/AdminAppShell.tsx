"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin-layout/AdminSidebar";
import AdminTopbar from "@/components/admin-layout/AdminTopbar";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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

      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 lg:py-7 pb-16">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
