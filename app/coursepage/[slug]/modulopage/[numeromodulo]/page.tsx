"use client";

import React from "react";
import { Lock, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: number;
  title: string;
  isUnlocked: boolean;
}

interface CourseModuleStructureProps {
  courseTitle: string;
  moduleNumber: number;
  lessons: Lesson[];
}

export default function ModuloPage({
  courseTitle = "Arquitetura de Software",
  moduleNumber = 1,
  lessons = [
    { id: 1, title: "Aula 1", isUnlocked: true },
    { id: 2, title: "Aula 2", isUnlocked: false },
    { id: 3, title: "Aula 3", isUnlocked: false },
    { id: 4, title: "Aula 4", isUnlocked: false },
    { id: 5, title: "Aula 5", isUnlocked: false },
  ],
}: CourseModuleStructureProps) {
  const router = useRouter();

  const handleLessonClick = (lessonId: number) => {
    router.push(
      `/coursepage/${courseTitle}/modulopage/${moduleNumber}/lesson/${lessonId}`
    );
  };

  return (
    <div className="bg-zinc-800 text-white p-6 rounded-lg mx-auto">
      <div className="w-full mb-6 flex items-center justify-between">
        <h2 className="text-lg font-normal mb-1">Curso: {courseTitle}</h2>
        <p className="text-sm text-zinc-400">Módulo: {moduleNumber}</p>
      </div>
      <div className="flex flex-col gap-4">
        {lessons
          .reduce((rows, lesson, index) => {
            if (index % 2 === 0) {
              rows.push(lessons.slice(index, index + 2));
            }
            return rows;
          }, [] as Lesson[][])
          .map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center justify-start gap-4"
            >
              {row.map((lesson, lessonIndex) => (
                <>
                  <Button
                    key={lesson.id}
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
                  {lessonIndex === 0 && row.length > 1 && (
                    <div className="w-8 h-0.5 bg-zinc-600" />
                  )}
                </>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
