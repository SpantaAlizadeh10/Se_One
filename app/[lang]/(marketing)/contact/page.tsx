import type { Metadata } from "next";
import ContactHero from "@/components/marketing/contact/ContactHero";
import ContactForm from "@/components/marketing/contact/ContactForm";
import FAQSection from "@/components/marketing/contact/FAQSection";
import ResponseProcess from "@/components/marketing/contact/ResponseProcess";
import SubscribeBanner from "@/components/marketing/contact/SubscribeBanner";
import LatestCourses from "@/components/marketing/LatestCourses";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "We're here to answer your questions, help you choose the right course, and support your learning journey."
};

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactForm />
      <FAQSection />
      <ResponseProcess />
      <SubscribeBanner />
      <LatestCourses variant="popular" />
    </main>
  );
}
