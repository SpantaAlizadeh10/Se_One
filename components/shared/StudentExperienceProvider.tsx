"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUserProfile } from "@/lib/api/settings";
import { isApiConfigured } from "@/lib/is-api-configured";

type StudentExperience = {
  age: number | null;
  isChildMode: boolean;
  profileLoaded: boolean;
};

const StudentExperienceContext = createContext<StudentExperience>({
  age: null,
  isChildMode: false,
  profileLoaded: false,
});

export function StudentExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [age, setAge] = useState<number | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!isApiConfigured()) {
      setProfileLoaded(true);
      return;
    }
    let active = true;
    getUserProfile()
      .then((profile) => {
        if (!active || !profile.dateOfBirth) return;
        const birthParts = profile.dateOfBirth
          .split("T")[0]
          .split("-")
          .map(Number);
        const birthDate =
          birthParts.length === 3 && birthParts.every(Number.isFinite)
            ? new Date(birthParts[0], birthParts[1] - 1, birthParts[2])
            : new Date(profile.dateOfBirth);
        if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return;
        const now = new Date();
        const years = now.getFullYear() - birthDate.getFullYear();
        const birthdayPassed =
          now.getMonth() > birthDate.getMonth() ||
          (now.getMonth() === birthDate.getMonth() &&
            now.getDate() >= birthDate.getDate());
        setAge(years - (birthdayPassed ? 0 : 1));
      })
      .catch(() => {
        // Missing profile age safely keeps the standard dashboard experience.
      })
      .finally(() => {
        if (active) setProfileLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ age, isChildMode: age !== null && age < 14, profileLoaded }),
    [age, profileLoaded],
  );
  return (
    <StudentExperienceContext.Provider value={value}>
      {children}
    </StudentExperienceContext.Provider>
  );
}

export function useStudentExperience() {
  return useContext(StudentExperienceContext);
}
