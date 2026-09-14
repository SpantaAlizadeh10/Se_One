import type { Metadata } from "next";
import TeachersHero from "@/components/marketing/teachers/TeachersHero";
import TeacherShowcase from "@/components/marketing/TeacherShowcase";
import TeacherBenefits from "@/components/marketing/teachers/TeacherBenefits";
import TeacherSteps from "@/components/marketing/teachers/TeacherSteps";
import TeacherRequirements from "@/components/marketing/teachers/TeacherRequirements";
import TeacherCTA from "@/components/marketing/teachers/TeacherCTA";

export const metadata: Metadata = {
  title: "Teach with SE ONE",
  description:
    "Share your expertise with learners around the world, set your own schedule, and earn by teaching online.",
};

export default function TeachersPage() {
  return (
    <main>
      <TeachersHero />
      <TeacherShowcase />
      <TeacherBenefits />
      <TeacherSteps />
      <TeacherRequirements />
      <TeacherCTA />
    </main>
  );
}
