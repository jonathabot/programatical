"use client";

import GradientText from "./ui/gradient-text";
import { useEffect, useState } from "react";
import { Course } from "@/types/types";
import { getOnGoingCourses } from "@/lib/firebase/courses";
import { Skeleton } from "./ui/skeleton";
import useCoursePage from "@/hooks/route-to-course";
import { ScrollArea, ScrollBar } from "./ui/scrollarea";

export default function OngoingCourses() {
  const navigateToCourse = useCoursePage();
  const [onGoingCourses, setOnGoingCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getOnGoingCourses();
        setOnGoingCourses(courses);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      {!onGoingCourses ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      ) : (
        <ScrollArea className="rounded-md border">
          <div className="flex p-8">
            {onGoingCourses?.map((course) => (
              <div
                className="relative w-36 h-36 cursor-pointer mr-6"
                key={course.id}
              >
                {/* Green border circle */}
                <div className="absolute inset-0 rounded-full border-4 border-pmgGreen"></div>

                {/* Gray inner circle with content */}
                <div
                  className="absolute inset-2 bg-gray-300 rounded-full flex flex-col items-center justify-center text-center hover:bg-gray-400 cursor-pointer"
                  onClick={() => navigateToCourse(course.id)}
                >
                  <span className="text-gray-500 text-sm px-4 leading-3">
                    {course.courseName}
                  </span>
                  <span className="text-gray-600 text-3xl mt-2">10%</span>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </>
  );
}
