export type NavItem = {
  href: string;
  labelKey: string;
  titleKey: string;
  group: "dashboard" | "profile";
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "studentNav.myCourses",
    titleKey: "studentNav.titles.dashboard",
    group: "dashboard",
  },
  {
    href: "/dashboard/classes",
    labelKey: "studentNav.classes",
    titleKey: "studentNav.titles.classes",
    group: "dashboard",
  },
  {
    href: "/dashboard/practice",
    labelKey: "studentNav.practice",
    titleKey: "studentNav.titles.practice",
    group: "dashboard",
  },
  {
    href: "/dashboard/assignments",
    labelKey: "studentNav.assignments",
    titleKey: "studentNav.titles.assignments",
    group: "dashboard",
  },
  {
    href: "/dashboard/teachers",
    labelKey: "studentNav.findTeacher",
    titleKey: "studentNav.titles.findTeacher",
    group: "dashboard",
  },
  {
    href: "/dashboard/wishlist",
    labelKey: "studentNav.wishlist",
    titleKey: "studentNav.titles.wishlist",
    group: "dashboard",
  },
  {
    href: "/dashboard/messages",
    labelKey: "studentNav.messages",
    titleKey: "studentNav.titles.messages",
    group: "profile",
  },
  {
    href: "/dashboard/tickets",
    labelKey: "studentNav.tickets",
    titleKey: "studentNav.titles.tickets",
    group: "profile",
  },
  {
    href: "/dashboard/settings",
    labelKey: "studentNav.settings",
    titleKey: "studentNav.titles.settings",
    group: "profile",
  },
];
