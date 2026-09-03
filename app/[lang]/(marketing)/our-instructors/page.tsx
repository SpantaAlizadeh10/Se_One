import type { Metadata } from "next";
import InstructorsList from "@/components/marketing/instructors/InstructorsList";

export const metadata: Metadata = {
  title: "Our Instructors",
  description: "Meet the expert, experienced teachers behind SE ONE's courses."
};

export default function InstructorsPage() {
  return <InstructorsList />;
}
