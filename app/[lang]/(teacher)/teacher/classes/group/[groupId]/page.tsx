import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ClassGroupChat from "@/components/messages/ClassGroupChat";
import { withLocale } from "@/lib/i18n/paths";
import { isLocale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function TeacherClassGroupPage({
  params,
}: {
  params: { lang: string; groupId: string };
}) {
  const fa = params.lang === "fa";
  const backHref = withLocale(
    isLocale(params.lang) ? params.lang : "fa",
    "/teacher/classes",
  );
  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-[12px] font-semibold text-blue"
      >
        {fa ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
        {fa ? "بازگشت به کلاس‌ها" : "Back to classes"}
      </Link>
      <ClassGroupChat groupId={params.groupId} />
    </div>
  );
}
