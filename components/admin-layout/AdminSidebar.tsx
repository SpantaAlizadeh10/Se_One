"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Tag,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  Trash2,
  X,
  ShieldCheck
} from "lucide-react";
import { adminNavItems } from "@/lib/admin-nav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import { clearSession } from "@/lib/auth-client";
import { logoutApi } from "@/lib/api/auth";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

const icons: Record<string, React.ElementType> = {
  "/admin": LayoutDashboard,
  "/admin/students": Users,
  "/admin/teachers": GraduationCap,
  "/admin/courses": Tag,
  "/admin/settings": SettingsIcon
};

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const currentPath = stripLocale(pathname || "/");
  const router = useRouter();
  const { t, href } = useLanguage();

  const dashboardItems = adminNavItems.filter((i) => i.group === "dashboard");
  const profileItems = adminNavItems.filter((i) => i.group === "profile");

  const logout = async () => {
    await logoutApi();
    clearSession();
    router.push(href("/login"));
  };

  const renderItem = (item: (typeof adminNavItems)[number]) => {
    const Icon = icons[item.href];
    const active = currentPath === item.href;
    return (
      <Link
        key={item.href}
        href={href(item.href)}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-[11px] px-3 py-2.5 mb-0.5 text-[14.5px] font-medium transition-colors ${
          active ? "bg-ink text-white font-semibold" : "text-ink70 hover:bg-cream hover:text-ink"
        }`}
      >
        <Icon size={17} className={active ? "text-danger flex-shrink-0" : "flex-shrink-0"} />
        <span className="truncate">{t(item.labelKey)}</span>
        {item.href === "/admin" && <ChevronRight size={14} className="ms-auto opacity-50 rtl:rotate-180" />}
      </Link>
    );
  };

  return (
    <aside
      className={`bg-white border-e border-line px-5 py-6 lg:py-7 flex flex-col
        fixed inset-y-0 start-0 z-50 w-[248px] overflow-y-auto thin-scroll
        transform transition-transform duration-300 ease-in-out
        lg:static lg:z-auto lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full rtl:translate-x-full"}`}
    >
      <div className="flex items-center justify-between mb-6 lg:mb-7">
        <Link href={href("/admin")} className="font-serif font-bold text-[22px] tracking-wide text-goldDeep mx-1.5">
          SE <span className="text-ink font-medium">ONE</span>
        </Link>
        <button onClick={onClose} aria-label="Close menu" className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-ink70 hover:bg-cream">
          <X size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 bg-danger/10 text-danger text-[11px] font-bold px-3 py-2 rounded-lg mb-6">
        <ShieldCheck size={14} className="shrink-0" />
        {t("adminNav.badge")}
      </div>

      <div className="text-[11px] font-bold tracking-widest uppercase text-muted mx-2.5 mb-2">
        {t("adminNav.section1")}
      </div>
      {dashboardItems.map(renderItem)}

      <div className="text-[11px] font-bold tracking-widest uppercase text-muted mx-2.5 mt-5 mb-2">
        {t("adminNav.section2")}
      </div>
      {profileItems.map(renderItem)}

      <div className="flex-1" />

      <div className="mb-4">
        <LanguageSwitcher />
      </div>

      <div className="bg-cream border border-line rounded-md p-4">
        <div className="text-[11px] font-bold tracking-wider uppercase text-muted mb-3">{t("adminNav.dangerZone")}</div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13.5px] font-semibold bg-white border border-line text-ink70 hover:border-ink70 transition-colors">
          <LogOut size={15} />
          {t("adminNav.logout")}
        </button>
      </div>
    </aside>
  );
}
