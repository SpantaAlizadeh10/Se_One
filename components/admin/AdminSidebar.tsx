"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  X,
  Search,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import { clearSession } from "@/lib/auth-client";
import { logoutApi } from "@/lib/api/auth";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

const icons: Record<string, React.ElementType> = {
  "/admin": LayoutDashboard,
  "/admin/courses": BookOpen,
  "/admin/students": Users,
  "/admin/teachers": GraduationCap,
  "/admin/blog": FileText,
  "/admin/settings": SettingsIcon,
};

export default function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const currentPath = stripLocale(pathname || "/");
  const router = useRouter();
  const { t, href } = useLanguage();

  const adminNavItems = [
    { href: "/admin", labelKey: "adminNav.overview", group: "main" },
    { href: "/admin/courses", labelKey: "adminNav.courses", group: "main" },
    { href: "/admin/students", labelKey: "adminNav.students", group: "main" },
    { href: "/admin/teachers", labelKey: "adminNav.teachers", group: "main" },
    { href: "/admin/blog", labelKey: "adminNav.blog", group: "main" },
    {
      href: "/admin/settings",
      labelKey: "adminNav.settings",
      group: "settings",
    },
  ];

  const mainItems = adminNavItems.filter((i) => i.group === "main");
  const settingsItems = adminNavItems.filter((i) => i.group === "settings");

  const logout = async () => {
    await logoutApi();
    clearSession();
    router.push(href("/login"));
  };

  const renderItem = (item: (typeof adminNavItems)[number]) => {
    const Icon = icons[item.href];
    const active =
      currentPath === item.href || currentPath.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={href(item.href)}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-[11px] px-3 py-2.5 mb-0.5 text-[14.5px] font-medium transition-colors ${
          active
            ? "bg-ink text-white font-semibold"
            : "text-ink70 hover:bg-cream hover:text-ink"
        }`}
      >
        <Icon
          size={17}
          className={active ? "text-gold flex-shrink-0" : "flex-shrink-0"}
        />
        <span className="truncate">{t(item.labelKey)}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`bg-white border-e border-line px-4 sm:px-5 py-6 lg:py-7 flex-col
        w-[248px] max-w-[75vw] shrink-0 self-stretch overflow-y-auto thin-scroll
        ${isOpen ? "flex" : "hidden"}
        lg:flex lg:sticky lg:top-0 lg:h-screen`}
    >
      <div className="flex items-center justify-between mb-6 lg:mb-7">
        <Link
          href={href("/admin")}
          className="font-serif font-bold text-[22px] tracking-wide text-goldDeep mx-1.5"
        >
          SE <span className="text-ink font-medium">ONE</span>
        </Link>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-ink70 hover:bg-cream"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2.5 bg-cream border border-line rounded-xl px-3 py-2.5 mb-6">
        <Search size={16} className="text-muted shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-[13.5px] w-full placeholder:text-muted"
        />
      </div>

      <div className="text-[11px] font-bold tracking-widest uppercase text-muted mx-2.5 mb-2">
        Main Menu
      </div>
      {mainItems.map(renderItem)}

      <div className="text-[11px] font-bold tracking-widest uppercase text-muted mx-2.5 mt-5 mb-2">
        Settings
      </div>
      {settingsItems.map(renderItem)}

      <div className="flex-1" />

      <div className="mb-4">
        <LanguageSwitcher />
      </div>

      <div className="bg-cream border border-line rounded-md p-4">
        <div className="text-[11px] font-bold tracking-wider uppercase text-muted mb-3">
          Account
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13.5px] font-semibold bg-white border border-line text-ink70 hover:border-ink70 transition-colors"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
