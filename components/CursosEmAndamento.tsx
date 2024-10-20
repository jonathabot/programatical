"use client";

import routingToCourse from "@/hooks/route-to-course";
import GradientText from "./ui/gradient-text";
import { useEffect, useState } from "react";
import { Curso } from "@/types/courses";
import { getOnGoingCourses } from "@/lib/firebase/courses";
import { Skeleton } from "./ui/skeleton";

export default function CursosEmAndamento() {
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
    <div className="flex flex-col justify-center select-none">
      <GradientText className="text-4xl mb-4">Cursos em Andamento</GradientText>

      {onGoingCourses?.length == 0 ? (
        <Skeleton className="w-32 h-32 rounded-full" />
      ) : null}

      {onGoingCourses?.map((course) => (
        <div className="relative w-36 h-36 cursor-pointer" key={course.id}>
          {/* Green border circle */}
          <div className="absolute inset-0 rounded-full border-4 border-[#00FF19]"></div>

          {/* Gray inner circle with content */}
          <div
            className="absolute inset-2 bg-gray-300 rounded-full flex flex-col items-center justify-center text-center hover:bg-gray-400 cursor-pointer"
            onClick={() => routingToCourse("def3-dfl4")}
          >
            <span className="text-gray-500 text-sm px-4 leading-3">
              {course.nomeCurso}
            </span>
            <span className="text-gray-600 text-3xl mt-2">10%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
