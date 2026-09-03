"use client";

import { useCallback, useEffect, useState } from "react";
import { coursesPricingSeed, loadPricing, savePricing, PRICING_STORAGE_KEY, type CoursePricing } from "./courses-pricing";

/**
 * Same hydration-safe + cross-tab-sync pattern as useTeacherSlots:
 * starts from the static seed (matches SSR), swaps in the real
 * localStorage value after mount, and listens for changes made in
 * other tabs (e.g. an admin editing a discount while a storefront
 * page is open elsewhere).
 */
export function useCoursesPricing() {
  const [pricing, setPricing] = useState<CoursePricing[]>(coursesPricingSeed);

  useEffect(() => {
    setPricing(loadPricing());

    const onStorage = (e: StorageEvent) => {
      if (e.key === PRICING_STORAGE_KEY) setPricing(loadPricing());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((updater: (prev: CoursePricing[]) => CoursePricing[]) => {
    setPricing((prev) => {
      const next = updater(prev);
      savePricing(next);
      return next;
    });
  }, []);

  return [pricing, update] as const;
}
