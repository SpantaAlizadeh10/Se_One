import type { Metadata } from "next";
import LegalPageContent from "@/components/marketing/legal/LegalPageContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of the SE ONE platform."
};

export default function TermsPage() {
  return <LegalPageContent pageKey="terms" />;
}
