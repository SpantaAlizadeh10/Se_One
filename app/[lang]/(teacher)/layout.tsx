import TeacherAppShell from "@/components/teacher-layout/TeacherAppShell";

export default function TeacherGroupLayout({ children }: { children: React.ReactNode }) {
  return <TeacherAppShell>{children}</TeacherAppShell>;
}
