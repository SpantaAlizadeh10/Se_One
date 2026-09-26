import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import FeatureCards from "@/components/marketing/FeatureCards";
import LatestCourses from "@/components/marketing/LatestCourses";
import TeacherShowcase from "@/components/marketing/TeacherShowcase";
import YouTubeVideos from "@/components/marketing/YouTubeVideos";
import Testimonials from "@/components/marketing/Testimonials";
import NewsletterCTA from "@/components/marketing/NewsletterCTA";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Learn English and German with interactive lessons, experienced teachers, and personalized courses at SE ONE.",
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <LatestCourses />
      <FeatureCards />
      <TeacherShowcase />
      <YouTubeVideos />
      <Testimonials />
      <NewsletterCTA />
    </main>
  );
}
