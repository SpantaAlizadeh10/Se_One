"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardCheck,
  GraduationCap,
  Heart,
  MessageSquare,
  Settings as SettingsIcon,
  Search,
  ChevronRight,
  LogOut,
  Trash2,
  X
} from "lucide-react";
import { navItems } from "@/lib/nav";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { stripLocale } from "@/lib/i18n/paths";
import { clearSession } from "@/lib/auth-client";
import { logoutApi } from "@/lib/api/auth";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

const icons: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/practice": Dumbbell,
  "/dashboard/assignments": ClipboardCheck,
  "/dashboard/teachers": GraduationCap,
  "/dashboard/wishlist": Heart,
  "/dashboard/messages": MessageSquare,
  "/dashboard/settings": SettingsIcon
};

export default function Sidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const currentPath = stripLocale(pathname || "/");
  const router = useRouter();
  const { t, href } = useLanguage();

  const dashboardItems = navItems.filter((i) => i.group === "dashboard");
  const profileItems = navItems.filter((i) => i.group === "profile");

  const logout = async () => {
    await logoutApi();
    clearSession();
    router.push(href("/login"));
  };

  const renderItem = (item: (typeof navItems)[number]) => {
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
        <Icon size={17} className={active ? "text-gold flex-shrink-0" : "flex-shrink-0"} />
        <span className="truncate">{t(item.labelKey)}</span>
        {item.badge && !active && (
          <span className="ms-auto bg-danger text-white text-[10.5px] font-bold px-[7px] py-[2px] rounded-full">
            {item.badge}
          </span>
        )}
        {item.href === "/dashboard" && (
          <ChevronRight size={14} className="ms-auto opacity-50 rtl:rotate-180" />
        )}
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
        <Link href={href("/dashboard")} className="font-serif font-bold text-[22px] tracking-wide text-goldDeep mx-1.5">
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
          placeholder={t("studentNav.search")}
          className="bg-transparent outline-none text-[13.5px] w-full placeholder:text-muted"
        />
      </div>

      <div className="text-[11px] font-bold tracking-widest uppercase text-muted mx-2.5 mb-2">
        {t("studentNav.section1")}
      </div>
      {dashboardItems.map(renderItem)}

      <div className="text-[11px] font-bold tracking-widest uppercase text-muted mx-2.5 mt-5 mb-2">
        {t("studentNav.section2")}
      </div>
      {profileItems.map(renderItem)}

      <div className="flex-1" />

      <div className="mb-4">
        <LanguageSwitcher />
      </div>

      <div className="bg-cream border border-line rounded-md p-4">
        <div className="text-[11px] font-bold tracking-wider uppercase text-muted mb-3">
          {t("studentNav.dangerZone")}
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13.5px] font-semibold mb-2 bg-white border border-line text-ink70 hover:border-ink70 transition-colors">
          <LogOut size={15} />
          {t("studentNav.logout")}
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13.5px] font-semibold bg-danger/10 text-danger hover:bg-danger/15 transition-colors">
          <Trash2 size={15} />
          {t("studentNav.deleteAccount")}
        </button>
      </div>
    </aside>
  );
}
