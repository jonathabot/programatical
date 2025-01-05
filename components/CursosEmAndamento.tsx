"use client";

import GradientText from "./ui/gradient-text";
import { useEffect, useState } from "react";
import { Curso } from "@/types/types";
import { getOnGoingCourses } from "@/lib/firebase/courses";
import { Skeleton } from "./ui/skeleton";
import useCoursePage from "@/hooks/route-to-course";

export default function CursosEmAndamento() {
  const navigateToCourse = useCoursePage();
  const [onGoingCourses, setOnGoingCourses] = useState<Curso[] | null>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getOnGoingCourses();
        setOnGoingCourses(courses);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col justify-center select-none w-full">
      <GradientText className="text-4xl mb-4 text-center md:text-start">
        Cursos em Andamento
      </GradientText>

      <div className="flex items-center justify-center md:justify-start">
        {onGoingCourses?.length == 0 ? (
          <Skeleton className="w-32 h-32 rounded-full" />
        ) : null}

        {onGoingCourses?.map((course) => (
          <div
            className="relative w-36 h-36 cursor-pointer mr-6"
            key={course.id}
          >
            {/* Green border circle */}
            <div className="absolute inset-0 rounded-full border-4 border-[#00FF19]"></div>

            {/* Gray inner circle with content */}
            <div
              className="absolute inset-2 bg-gray-300 rounded-full flex flex-col items-center justify-center text-center hover:bg-gray-400 cursor-pointer"
              onClick={() => navigateToCourse(course.id)}
            >
              <span className="text-gray-500 text-sm px-4 leading-3">
                {course.nomeCurso}
              </span>
              <span className="text-gray-600 text-3xl mt-2">10%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
