"use client";

import GradientText from "./ui/gradient-text";
import { useEffect, useState } from "react";
import { Course } from "@/types/types";
import {
  getOnGoingCourses,
  getUserEnrollmentsRequest,
  getCourseWithModulesByDocId,
  getUserModuleCompletionsRequest,
} from "@/lib/firebase/courses";
import { Skeleton } from "./ui/skeleton";
import useCoursePage from "@/hooks/route-to-course";
import { ScrollArea, ScrollBar } from "./ui/scrollarea";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function OngoingCourses() {
  const navigateToCourse = useCoursePage();
  const [ongoingCourses, setOngoingCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);
  const [courseProgress, setCourseProgress] = useState<Array<[string, number]>>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [allCourses, userEnrollments] = await Promise.all([
          getOnGoingCourses(),
          getUserEnrollmentsRequest(user.uid),
        ]);

        const enrolledCourseIds = userEnrollments.map((enrollment) => enrollment.courseId);
        const enrolledCourses = allCourses.filter((course) => enrolledCourseIds.includes(course.id) && course.active);

        const progressPromises = enrolledCourses.map(async (course) => {
          const courseWithModules = await getCourseWithModulesByDocId(course.id);
          if (!courseWithModules) return [course.id, 0] as [string, number];

          const activeModules = courseWithModules.modules.filter((module) => module.isActive);
          const userCompletions = await getUserModuleCompletionsRequest(course.id, user.uid);

          const uniqueCompletedModuleIds = Object.keys(
            userCompletions.reduce((acc, completion) => {
              acc[completion.moduleId] = true;
              return acc;
            }, {} as Record<string, boolean>)
          );

          const completedActiveModules = uniqueCompletedModuleIds.filter((moduleId) =>
            activeModules.some((module) => module.moduleId === moduleId)
          );

          const progress = Math.round((completedActiveModules.length / activeModules.length) * 100);
          return [course.id, progress] as [string, number];
        });

        const progress = await Promise.all(progressPromises);
        setCourseProgress(progress);
        setOngoingCourses(enrolledCourses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  return (
    <>
      <div className="rounded-md bg-gradient-to-br from-pmgGreen to-emerald-500 p-[2px]">
        <ScrollArea className="rounded-md bg-gray-900">
          <div className="flex p-8">
            {loading ? (
              <Skeleton className="w-36 h-36 rounded-full" />
            ) : ongoingCourses?.length == 0 ? (
              <span>Poxa! Pelo visto você não iniciou nenhum curso ainda! </span>
            ) : (
              ongoingCourses?.map((course) => (
                <div className="relative w-36 h-36 cursor-pointer mr-6" key={course.id}>
                  <div className="absolute inset-0 rounded-full border-4 border-pmgGreen"></div>

                  <div
                    className="absolute inset-2 bg-gray-300 rounded-full flex flex-col items-center justify-center text-center hover:bg-gray-400 cursor-pointer"
                    onClick={() => navigateToCourse(course.id)}
                  >
                    <span className="text-gray-500 text-sm px-4 leading-3">{course.courseName}</span>
                    <span className="text-gray-600 text-3xl mt-2">
                      {courseProgress.find(([id, progress]) => id === course.id)?.[1] || 0}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
}
