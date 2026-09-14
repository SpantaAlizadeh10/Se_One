"use client";

import { useEffect, useState } from "react";
import { getCourses } from "./api/courses";
import type { Course } from "./api/courses";

export function useCourses(lang: string, fallback: Course[]) {
  const [courses, setCourses] = useState<Course[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setCourses(fallback);
    setLoading(true);

    getCourses(lang)
      .then((remoteCourses) => {
        if (active && remoteCourses.length > 0) setCourses(remoteCourses);
      })
      .catch(() => {
        // Keep the sample catalog when the .NET API is unavailable.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lang]);

  return { courses, loading };
}
