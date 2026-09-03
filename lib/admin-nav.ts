export type AdminNavItem = {
  href: string;
  labelKey: string;
  titleKey: string;
  group: "dashboard" | "profile";
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", labelKey: "adminNav.overview", titleKey: "adminNav.titles.overview", group: "dashboard" },
  { href: "/admin/students", labelKey: "adminNav.students", titleKey: "adminNav.titles.students", group: "dashboard" },
  { href: "/admin/teachers", labelKey: "adminNav.teachers", titleKey: "adminNav.titles.teachers", group: "dashboard" },
  { href: "/admin/courses", labelKey: "adminNav.courses", titleKey: "adminNav.titles.courses", group: "dashboard" },
  { href: "/admin/settings", labelKey: "adminNav.settings", titleKey: "adminNav.titles.settings", group: "profile" }
];
