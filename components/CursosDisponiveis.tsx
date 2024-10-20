// components/ui/CursosDisponiveis.tsx

"use client";

import { useEffect, useState } from "react";
import routingToCourse from "@/hooks/route-to-course";
import GradientText from "./ui/gradient-text";
import { getAvailableCourses } from "@/lib/firebase/courses";
import { Curso } from "@/types/courses"; // Importando a interface
import { Skeleton } from "./ui/skeleton";
import useCoursePage from "@/hooks/route-to-course";

export default function CursosDisponiveis() {
  const navigateToCourse = useCoursePage();
  const [availableCourses, setAvailableCourses] = useState<Curso[] | null>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getAvailableCourses();
        setAvailableCourses(courses);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col justify-center select-none">
      <GradientText className="text-4xl mb-4">Cursos Disponíveis</GradientText>

      {availableCourses?.length == 0 ? (
        <Skeleton className="w-32 h-32 rounded-full" />
      ) : null}

      {availableCourses?.map((course) => (
        <div className="relative w-32 h-32" key={course.id}>
          {/* Blue border circle */}
          <div className="absolute inset-0 rounded-full border-4 border-[#00C2FF]"></div>

          {/* Gray inner circle with content */}
          <div
            className="absolute inset-2 bg-gray-300 rounded-full flex items-center justify-center text-center hover:bg-gray-400 cursor-pointer"
            onClick={() => navigateToCourse(course.id)}
          >
            <span className="text-gray-500 text-base px-4 leading-4">
              {course.nomeCurso}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
