import StudentClassBrowser from "@/components/class-scheduling/StudentClassBrowser";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function StudentClassesPage() {
  return <StudentClassBrowser />;
}
