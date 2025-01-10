"use client";

import { Button } from "@/components/ui/button";
import { getCourseById, getCourseModules } from "@/lib/firebase/courses";
import { Course, CourseModule } from "@/types/types";
import { Lock, PlayCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CoursePage() {
  const router = useRouter();
  const { slug } = useParams();
  const courseId = String(slug);
  const [courseModules, setCourseModules] = useState<CourseModule[] | null>(
    null
  );
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);

  const handleModuleClick = (moduloslug: string) => {
    router.push(`/coursepage/${slug}/modulopage/${moduloslug}`);
  };

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modules = await getCourseModules(courseId);
        const course = await getCourseById(courseId);
        console.log(course);
        setCourseModules(modules);
        setCourseInfo(course);
      } catch (err) {
        console.log(err);
      }
    };
    fetchModules();
  }, []);

  return (
    <div className="w-1/2 text-white p-6">
      <div className="w-full mb-6 flex items-center justify-between">
        <h2 className="text-lg font-normal mb-1">
          Curso: {courseInfo?.courseName}
        </h2>
        <p className="text-sm text-zinc-400">
          Módulos Concluidos: 0/{courseModules?.length}
        </p>
      </div>

      <div className="w-full mb-6 flex items-center justify-center">
        <p className="text-sm text-zinc-400">{courseInfo?.courseDescription}</p>
      </div>

      <div className="space-y-2 flex flex-col justify-center items-center">
        {courseModules?.map((module) => (
          <Button
            key={module.id}
            variant="ghost"
            className={`w-1/2 justify-between text-left font-normal h-12 ${
              module.isActive
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
            }`}
            onClick={() => handleModuleClick(module.id)}
          >
            <span className="flex items-center gap-3">
              <span className="w-6 text-center text-sm">{module.order}</span>
              <span className="text-base">{module.nome}</span>
            </span>
            {module.isActive ? (
              <PlayCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </Button>
        ))}
        {courseModules?.length == 0 ? (
          <>
            <span className="text-center mt-5 text-zinc-300">
              Módulos para esse curso ainda não estão disponiveis. <br />
              Mais informações em breve!
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
