import type { Metadata } from "next";
import LegalPageContent from "@/components/marketing/legal/LegalPageContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SE ONE collects, uses, and protects your data."
};

export default function PrivacyPolicyPage() {
  return <LegalPageContent pageKey="privacy" />;
}
