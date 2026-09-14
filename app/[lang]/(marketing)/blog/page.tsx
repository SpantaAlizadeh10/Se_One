import type { Metadata } from "next";
import BlogHero from "@/components/marketing/blog/BlogHero";
import BlogGrid from "@/components/marketing/blog/BlogGrid";
import BlogNewsletter from "@/components/marketing/blog/BlogNewsletter";
import LatestCourses from "@/components/marketing/LatestCourses";

export const metadata: Metadata = {
  title: "Blog",
  description: "Explore our latest articles, tips, and resources for English learning success."
};

export default function BlogPage() {
  return (
    <main>
      <BlogHero />
      <BlogGrid />
      <BlogNewsletter />
      <LatestCourses variant="popular" />
    </main>
  );
}