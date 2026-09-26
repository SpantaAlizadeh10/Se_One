"use client";

import { useEffect, useState } from "react";
import CoursesHero from "@/components/marketing/courses/CoursesHero";
import LatestCourses from "@/components/marketing/LatestCourses";
import EnglishLevel from "@/components/marketing/courses/EnglishLevel";
import GermanLevel from "@/components/marketing/courses/GermanLevel";
import WhyLearn from "@/components/marketing/courses/WhyLearn";
import JourneyBanner from "@/components/marketing/courses/JourneyBanner";

export default function CoursesPage() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const initialSearch = new URLSearchParams(window.location.search).get(
      "search",
    );
    if (initialSearch) setQuery(initialSearch);
  }, []);

  return (
    <main>
      <CoursesHero query={query} onQueryChange={setQuery} />
      <LatestCourses variant="popular-cta" filterQuery={query} />
      <EnglishLevel />
      <GermanLevel />
      <WhyLearn />
      <JourneyBanner />
    </main>
  );
}
