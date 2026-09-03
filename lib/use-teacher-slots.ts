"use client";

import { useCallback, useEffect, useState } from "react";
import type { AvailabilitySlot } from "./teachers-directory";
import { loadSlots, saveSlots, slotsStorageKey } from "./slots-store";

/**
 * Live-ish, cross-tab slot state for one teacher. Starts from `seed`
 * (so server-rendered HTML and the first client render match — no
 * hydration mismatch), then swaps in the real localStorage-backed
 * value right after mount and stays in sync with other tabs via the
 * `storage` event.
 */
export function useTeacherSlots(teacherId: string, seed: AvailabilitySlot[]) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(seed);

  useEffect(() => {
    setSlots(loadSlots(teacherId, seed));

    const onStorage = (e: StorageEvent) => {
      if (e.key === slotsStorageKey(teacherId)) {
        setSlots(loadSlots(teacherId, seed));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const update = useCallback(
    (updater: (prev: AvailabilitySlot[]) => AvailabilitySlot[]) => {
      setSlots((prev) => {
        const next = updater(prev);
        saveSlots(teacherId, next);
        return next;
      });
    },
    [teacherId]
  );

  return [slots, update] as const;
}
