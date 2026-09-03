export type TeacherNavItem = {
  href: string;
  labelKey: string;
  titleKey: string;
  group: "dashboard" | "profile";
  badge?: number;
};

export const teacherNavItems: TeacherNavItem[] = [
  { href: "/teacher", labelKey: "teacherNav.overview", titleKey: "teacherNav.titles.overview", group: "dashboard" },
  { href: "/teacher/classes", labelKey: "teacherNav.classes", titleKey: "teacherNav.titles.classes", group: "dashboard" },
  { href: "/teacher/students", labelKey: "teacherNav.students", titleKey: "teacherNav.titles.students", group: "dashboard" },
  { href: "/teacher/schedule", labelKey: "teacherNav.schedule", titleKey: "teacherNav.titles.schedule", group: "dashboard" },
  { href: "/teacher/availability", labelKey: "teacherNav.availability", titleKey: "teacherNav.titles.availability", group: "dashboard" },
  { href: "/teacher/messages", labelKey: "teacherNav.messages", titleKey: "teacherNav.titles.messages", group: "profile", badge: 2 },
  { href: "/teacher/settings", labelKey: "teacherNav.settings", titleKey: "teacherNav.titles.settings", group: "profile" }
];
