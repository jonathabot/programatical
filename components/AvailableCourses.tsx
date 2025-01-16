"use client";

import { useEffect, useState } from "react";
import { getAvailableCourses } from "@/lib/firebase/courses";
import { Skeleton } from "./ui/skeleton";
import useCoursePage from "@/hooks/route-to-course";
import { Course } from "@/types/types";
import { ScrollArea, ScrollBar } from "./ui/scrollarea";

export default function AvailableCourses() {
  const navigateToCourse = useCoursePage();
  const [availableCourses, setAvailableCourses] = useState<Course[] | null>(
    null
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getAvailableCourses();
        setAvailableCourses(courses);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      {!availableCourses ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      ) : (
        <ScrollArea className="rounded-md border">
          <div className="flex p-8">
            {availableCourses?.length == 0 ? (
              <Skeleton className="w-32 h-32 rounded-full" />
            ) : null}

            {availableCourses?.map((course) => (
              <div className="relative w-32 h-32 mr-6" key={course.id}>
                {/* Blue border circle */}
                <div className="absolute inset-0 rounded-full border-4 border-jyunBlue"></div>

                {/* Gray inner circle with content */}
                <div
                  className="absolute inset-2 bg-gray-300 rounded-full flex items-center justify-center text-center hover:bg-gray-400 cursor-pointer"
                  onClick={() => navigateToCourse(course.id)}
                >
                  <span className="text-gray-500 text-base px-4 leading-4">
                    {course.courseName}
                  </span>
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
