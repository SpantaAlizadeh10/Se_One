import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SE ONE — Learn English with Confidence",
    short_name: "SE ONE",
    description:
      "Master English through interactive lessons, experienced teachers, and personalized learning paths.",
    start_url: "/fa",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#1C2B44",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
