"use client";

import React, { useEffect, useState } from "react";
import { Lock, Unlock, CheckCircle, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Class, ClassCompletion, Module } from "@/types/types";
import {
  getClassesFromModule,
  getModuleInfoByDocId,
  getUserClassesCompletionsFromModuleByDocId,
} from "@/lib/firebase/courses";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import BackButton from "@/components/BackButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trophy } from "lucide-react";

export default function ModuloPage() {
  const router = useRouter();
  const { slug, moduloslug } = useParams();
  const [moduleInfo, setModuleInfo] = useState<Module | null>(null);
  const [classes, setClasses] = useState<Class[] | null>(null);
  const [activeClasses, setActiveClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userClassesCompletions, setUserClassesCompletions] = useState<ClassCompletion[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showModuleCompletionAlert, setShowModuleCompletionAlert] = useState(false);

  const isLessonCompleted = (classId: string) => {
    return userClassesCompletions.some((completion) => completion.classId === classId);
  };

  const isLessonAvailable = (index: number) => {
    if (index === 0) return true;
    const previousLesson = activeClasses[index - 1];
    if (!previousLesson) return false;
    return isLessonCompleted(previousLesson.classId);
  };

  const handleLessonClick = (aulaslug: string, index: number) => {
    if (!isLessonAvailable(index)) return;
    router.push(`/coursepage/${slug}/modulopage/${moduloslug}/aulapage/${aulaslug}`);
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        setIsLoading(true);
        const module = await getModuleInfoByDocId(String(moduloslug));
        const classes = await getClassesFromModule(module.moduleId);
        const userModuleClassCompletionsResponse = await getUserClassesCompletionsFromModuleByDocId(
          String(moduloslug),
          user.uid
        );
        const activeClasses = classes.filter((_class) => _class.isActive);

        setModuleInfo(module);
        setClasses(classes);
        setActiveClasses(activeClasses);
        setUserClassesCompletions(userModuleClassCompletionsResponse);

        const allActiveClassesCompleted =
          activeClasses.length > 0 &&
          activeClasses.every((_class) =>
            userModuleClassCompletionsResponse.some((completion) => completion.classId === _class.classId)
          );

        if (allActiveClassesCompleted) {
          setShowModuleCompletionAlert(true);
        }
      } catch (error) {
        console.error("Error fetching module data:", error);
      } finally {
        setIsLoading(false);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [moduloslug, router]);

  if (isAuthLoading) {
    return <div className="w-1/2 text-white p-6 text-center">Carregando...</div>;
  }

  return (
    <div className="w-full max-w-screen-md mx-auto text-white p-6 flex flex-col items-start">
      <BackButton />
      {showModuleCompletionAlert && (
        <Alert className="mb-6 border-green-500 text-green-500 bg-green-900/20 flex items-center">
          <Trophy className="h-8 w-8 mr-4" style={{ color: "#f59e0b" }} />
          <div className="ml-4 mx-auto mt-1.5">
            <AlertTitle>Módulo Concluído!</AlertTitle>
            <AlertDescription>Parabéns! Você completou todas as aulas deste módulo.</AlertDescription>
          </div>
        </Alert>
      )}
      <div className="w-full mb-6 flex items-center justify-between">
        <h2 className="text-lg font-normal mb-1">Curso: Arquitetura de Software</h2>
        <p className="text-sm text-zinc-400">Módulo: {moduleInfo?.order}</p>
      </div>

      <div className="w-full mb-6 flex items-center justify-center">
        <p className="text-sm text-zinc-400">{moduleInfo?.moduleDescription}</p>
      </div>

      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col gap-4">
          {activeClasses.length > 0 ? (
            activeClasses.map((_class, index) => (
              <React.Fragment key={_class.id}>
                {index % 2 === 0 && (
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      className={`flex items-center justify-between bg-zinc-700 rounded-lg p-3 w-48 ${
                        isLessonAvailable(index)
                          ? "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                          : "text-zinc-600 hover:text-zinc-600 cursor-not-allowed hover:bg-zinc-700"
                      }`}
                      onClick={() => handleLessonClick(_class.id, index)}
                    >
                      <span className="mr-2">{_class.className}</span>
                      {isLessonAvailable(index) ? (
                        isLessonCompleted(_class.classId) ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Unlock className="w-5 h-5 text-zinc-400" />
                        )
                      ) : (
                        <Lock className="w-5 h-5 text-zinc-600" />
                      )}
                    </Button>

                    {activeClasses[index + 1] && (
                      <>
                        <Button
                          variant="ghost"
                          className={`flex items-center justify-between bg-zinc-700 rounded-lg p-3 w-48 ${
                            isLessonAvailable(index + 1)
                              ? "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                              : "text-zinc-600 cursor-not-allowed"
                          }`}
                          onClick={() => handleLessonClick(activeClasses[index + 1].id, index + 1)}
                        >
                          <span className="mr-2">{activeClasses[index + 1].className}</span>
                          {isLessonAvailable(index + 1) ? (
                            isLessonCompleted(activeClasses[index + 1].classId) ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Unlock className="w-5 h-5 text-zinc-400" />
                            )
                          ) : (
                            <Lock className="w-5 h-5 text-zinc-600" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))
          ) : isLoading ? (
            <div className="text-center text-zinc-400">Carregando...</div>
          ) : (
            <div className="text-center text-zinc-400">Nenhuma aula ativa disponível neste módulo.</div>
          )}
        </div>
      </div>
    </div>
  );
}
