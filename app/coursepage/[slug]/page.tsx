"use client";

import { Button } from "@/components/ui/button";
import { Lock, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type SlugProps = {
  params: {
    slug: string;
  };
};

export default function CoursePage({ params: { slug } }: SlugProps) {
  const router = useRouter();
  const modules = [
    { id: 1, name: "Módulo 1", isActive: true },
    { id: 2, name: "Módulo 2", isActive: false },
    { id: 3, name: "Módulo 3", isActive: false },
    { id: 4, name: "Módulo 4", isActive: false },
  ];

  const handleModuleClick = (moduleId: number) => {
    router.push(`/coursepage/${slug}/modulopage/${moduleId}`);
  };

  return (
    <div className="w-full max-w-md bg-zinc-800 text-white p-6 rounded-lg">
      <div className="w-full mb-6 flex items-center justify-between">
        <h2 className="text-lg font-normal mb-1">
          Curso: Arquitetura de Software
        </h2>
        <p className="text-sm text-zinc-400">Módulo: 0/{modules.length}</p>
      </div>
      <div className="w-full mb-6 flex items-center justify-center">
        <p className="text-sm text-zinc-400">
          Aprenda sobre Arquitetura de software
        </p>
      </div>
      <div className="space-y-2">
        {modules.map((module) => (
          <Button
            key={module.id}
            variant="ghost"
            className={`w-full justify-between text-left font-normal h-12 ${
              module.isActive
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
            }`}
            onClick={() => handleModuleClick(module.id)}
          >
            <span className="flex items-center gap-3">
              <span className="w-6 text-center text-sm">{module.id}</span>
              <span className="text-base">{module.name}</span>
            </span>
            {module.isActive ? (
              <PlayCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
