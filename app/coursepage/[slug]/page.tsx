"use client";

import { Button } from "@/components/ui/button";
import { getCourseById, getCourseWithModulesByDocId } from "@/lib/firebase/courses";
import { Course, CourseModule, Module } from "@/types/types";
import { Lock, Unlock, CheckCircle, Trophy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { CourseWithModules, ModuleCompletion } from "@/types/types";
import { getUserClassesCompletionsFromModuleByDocId, getUserModuleCompletionsRequest } from "@/lib/firebase/courses";
import BackButton from "@/components/BackButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CoursePage() {
  const router = useRouter();
  const { slug } = useParams();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleCompletions, setModuleCompletions] = useState<ModuleCompletion[]>([]);
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user) return;

      try {
        const courseData = await getCourseWithModulesByDocId(String(slug));
        setCourse(courseData);

        const completions = await getUserModuleCompletionsRequest(String(slug), user.uid);
        setModuleCompletions(completions);
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [slug, user]);

  const isModuleAvailable = (module: Module, index: number): boolean => {
    if (index === 0) return true;

    const previousModule = course?.modules[index - 1];
    if (!previousModule) return false;

    return moduleCompletions.some((completion) => completion.moduleId === previousModule.moduleId);
  };

  const handleModuleClick = (module: Module, index: number) => {
    if (!isModuleAvailable(module, index)) return;
    router.push(`/coursepage/${slug}/modulopage/${module.id}`);
  };

  if (isLoading) {
    return <div className="w-1/2 text-white p-6 text-center">Carregando...</div>;
  }

  if (!course) {
    return <div className="w-1/2 text-white p-6 text-center">Curso não encontrado</div>;
  }

  const activeModules = course.modules.filter((module) => module.isActive);
  const isCourseCompleted =
    activeModules.length > 0 &&
    activeModules.every((activeModule) =>
      moduleCompletions.some((completion) => completion.moduleId === activeModule.moduleId)
    );

  return (
    <div className="w-1/2 text-white p-6">
      <BackButton />
      {isCourseCompleted && (
        <Alert className="mb-6 border-green-500 text-green-500 bg-green-900/20 flex items-center">
          <Trophy className="h-8 w-8" style={{ color: "#f59e0b" }} />
          <div className="ml-4 mx-auto mt-1.5">
            <AlertTitle>Curso Concluído!</AlertTitle>
            <AlertDescription>Parabéns! Você já concluiu todos os módulos ativos deste curso.</AlertDescription>
          </div>
        </Alert>
      )}
      <div className="w-full mb-6 flex items-center justify-between">
        <h2 className="text-lg font-normal mb-1">Curso: {course.courseName}</h2>
        <p className="text-sm text-zinc-400">
          Módulos Concluidos: {moduleCompletions.length}/{course.modules.length}
        </p>
      </div>

      <div className="w-full mb-6 flex items-center justify-center">
        <p className="text-sm text-zinc-400">{course.courseDescription}</p>
      </div>

      <div className="space-y-2 flex flex-col justify-center items-center">
        {course.modules
          .filter((module) => module.isActive)
          .map((module, index) => {
            const isAvailable = isModuleAvailable(module, index);
            const isCompleted = moduleCompletions.some((completion) => completion.moduleId === module.moduleId);

            return (
              <Button
                key={module.id}
                variant="ghost"
                className={`w-1/2 justify-between text-left font-normal h-12 ${
                  isAvailable ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                }`}
                onClick={() => handleModuleClick(module, index)}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm">{module.order}</span>
                  <span className="text-base">{module.moduleName}</span>
                </span>
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : isAvailable ? (
                  <Unlock className="h-5 w-5 text-cyan-500" />
                ) : (
                  <Lock className="h-5 w-5 text-zinc-400" />
                )}
              </Button>
            );
          })}
        {course.modules.filter((module) => module.isActive).length === 0 ? (
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
