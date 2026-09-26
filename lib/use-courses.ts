"use client";

import { useEffect, useState } from "react";
import { getCourses } from "./api/courses";
import type { Course } from "./api/courses";

export function useCourses(lang: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setCourses([]);
    setLoading(true);

    getCourses(lang)
      .then((remoteCourses) => {
        if (active) setCourses(remoteCourses);
      })
      .catch(() => {
        if (active) setCourses([]);
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
