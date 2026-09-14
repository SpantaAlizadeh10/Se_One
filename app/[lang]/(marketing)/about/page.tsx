import type { Metadata } from "next";
import AboutHero from "@/components/marketing/about/AboutHero";
import MissionVision from "@/components/marketing/about/MissionVision";
import OurStory from "@/components/marketing/about/OurStory";
import TeachingPhilosophy from "@/components/marketing/TeachingPhilosophy";

export const metadata: Metadata = {
  title: "About Us",
  description: "Every learner has a different story, goal, and pace — learn how SE ONE approaches personalized English learning."
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <MissionVision />
      <OurStory />
      <TeachingPhilosophy />
    </main>
  );
}
