import AdminAppShell from "@/components/admin-layout/AdminAppShell";

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <AdminAppShell>{children}</AdminAppShell>;
}
