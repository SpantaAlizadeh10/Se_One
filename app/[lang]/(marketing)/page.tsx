import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import FeatureCards from "@/components/marketing/FeatureCards";
import LatestCourses from "@/components/marketing/LatestCourses";
import EnglishLevel from "@/components/marketing/courses/EnglishLevel";
import GermanLevel from "@/components/marketing/courses/GermanLevel";
import DeferredHomeSections from "@/components/marketing/DeferredHomeSections";
import Testimonials from "@/components/marketing/Testimonials";
import NewsletterCTA from "@/components/marketing/NewsletterCTA";
import HomeLatestArticles from "@/components/marketing/HomeLatestArticles";

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
      <EnglishLevel />
      <GermanLevel />
      <FeatureCards />
      <DeferredHomeSections />
      <HomeLatestArticles />
      <Testimonials />
      <NewsletterCTA />
    </main>
  );
}
