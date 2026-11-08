"use client";

import { useEffect, useState } from "react";
import { getCourses } from "./api/courses";
import type { Course } from "./api/courses";
import { ApiError } from "./api/client";

export function useCourses(lang: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setCourses([]);
    setLoading(true);
    setError(null);

    getCourses(lang)
      .then((remoteCourses) => {
        if (active) setCourses(remoteCourses);
      }).catch((reason: unknown) => {
        if (active) {
          setCourses([]);
          setError(
            reason instanceof ApiError && reason.status > 0
              ? `HTTP ${reason.status}: ${reason.message}`
              : reason instanceof Error
                ? reason.message
                : "Unknown course API error",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lang, reloadKey]);

  return {
    courses,
    loading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
