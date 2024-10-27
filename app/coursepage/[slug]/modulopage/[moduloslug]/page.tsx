"use client";

import React from "react";
import { Lock, PlayCircle, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const aulas = [
  { id: 1, title: "Aula 1", isUnlocked: true },
  { id: 2, title: "Aula 2", isUnlocked: false },
  { id: 3, title: "Aula 3", isUnlocked: false },
  { id: 4, title: "Aula 4", isUnlocked: false },
  { id: 5, title: "Aula 5", isUnlocked: false },
];

export default function ModuloPage() {
  const router = useRouter();
  const { slug, moduloslug } = useParams();

  const handleLessonClick = (aulaslug: number) => {
    router.push(
      `/coursepage/${slug}/modulopage/${moduloslug}/aulapage/${aulaslug}`
    );
  };

  return (
    <div className="w-1/2 text-white p-6">
      <div className="w-full mb-6 flex items-center justify-between">
        <h2 className="text-lg font-normal mb-1">
          Curso: Arquitetura de Software
        </h2>
        <p className="text-sm text-zinc-400">Módulo: 1</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col gap-4">
          {aulas.map((lesson, index) => (
            <React.Fragment key={lesson.id}>
              {index % 2 === 0 && (
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    className={`flex items-center justify-between bg-zinc-700 rounded-lg p-3 w-48 ${
                      lesson.isUnlocked
                        ? "text-white"
                        : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                    }`}
                    onClick={() => handleLessonClick(lesson.id)}
                  >
                    <span className="mr-2">{lesson.title}</span>
                    {lesson.isUnlocked ? (
                      <PlayCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </Button>

                  {aulas[index + 1] && (
                    <>
                      <ChevronRight className="text-zinc-500" />
                      <Button
                        variant="ghost"
                        className={`flex items-center justify-between bg-zinc-700 rounded-lg p-3 w-48 ${
                          aulas[index + 1].isUnlocked
                            ? "text-white"
                            : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                        }`}
                        onClick={() => handleLessonClick(aulas[index + 1].id)}
                      >
                        <span className="mr-2">{aulas[index + 1].title}</span>
                        {aulas[index + 1].isUnlocked ? (
                          <PlayCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
