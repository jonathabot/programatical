"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function useCoursePage() {
  const router = useRouter();

  const navigateToCourse = useCallback(
    (courseId: string) => {
      router.push(`/coursepage/${courseId}`);
    },
    [router]
  );

  return navigateToCourse;
}
