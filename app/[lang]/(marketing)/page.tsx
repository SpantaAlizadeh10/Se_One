import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import FeatureCards from "@/components/marketing/FeatureCards";
import SpeakToEveryone from "@/components/marketing/SpeakToEveryone";
import LatestCourses from "@/components/marketing/LatestCourses";
import TeachingPhilosophy from "@/components/marketing/TeachingPhilosophy";
import Testimonials from "@/components/marketing/Testimonials";
import NewsletterCTA from "@/components/marketing/NewsletterCTA";

export const metadata: Metadata = {
  title: "Home",
  description: "Master English through interactive lessons, experienced teachers, and personalized learning paths designed to help you speak with confidence."
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeatureCards />
      <SpeakToEveryone />
      <LatestCourses />
      <TeachingPhilosophy />
      <Testimonials />
      <NewsletterCTA />
    </main>
  );
}
