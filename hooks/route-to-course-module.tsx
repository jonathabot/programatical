"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function useCourseModulePage() {
  const router = useRouter();

  const navigateToCourseModule = useCallback(
    (moduleNumber: string) => {
      router.push(`/modulepage/${moduleNumber}`);
    },
    [router]
  );

  return navigateToCourseModule;
}
