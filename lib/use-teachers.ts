"use client";

import { useCallback, useEffect, useState } from "react";
import { getTeachers } from "./api/teachers";
import type { TeacherProfile } from "./teachers-directory";

export function useTeachers() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;

    getTeachers()
      .then((remoteTeachers) => {
        if (active) setTeachers(remoteTeachers);
      })
      .catch(() => {
        if (active) setTeachers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return { teachers, loading, refresh };
}
