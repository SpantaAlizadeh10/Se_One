"use client";

import { useEffect, useState } from "react";
import { getTeachers } from "./api/teachers";
import { teacherDirectory, type TeacherProfile } from "./teachers-directory";

export function useTeachers() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>(teacherDirectory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getTeachers()
      .then((remoteTeachers) => {
        if (active) setTeachers(remoteTeachers);
      })
      .catch(() => {
        // Keep the sample directory when the .NET API is not configured or unavailable.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { teachers, loading };
}
