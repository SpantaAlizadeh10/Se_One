"use client";

import { useState } from "react";
import CoursesHero from "@/components/marketing/courses/CoursesHero";
import LatestCourses from "@/components/marketing/LatestCourses";
import EnglishLevel from "@/components/marketing/courses/EnglishLevel";
import WhyLearn from "@/components/marketing/courses/WhyLearn";
import JourneyBanner from "@/components/marketing/courses/JourneyBanner";

export default function CoursesPage() {
  const [query, setQuery] = useState("");

  return (
    <main>
      <CoursesHero query={query} onQueryChange={setQuery} />
      <LatestCourses variant="popular-cta" filterQuery={query} />
      <EnglishLevel />
      <WhyLearn />
      <JourneyBanner />
    </main>
  );
}
