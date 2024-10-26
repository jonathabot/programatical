"use client";

import { Button } from "@/components/ui/button";
import { Lock, PlayCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function CoursePage() {
  const router = useRouter();
  const { slug } = useParams();
  const modules = [
    { id: "12fadfasc", name: "Módulo 1", isActive: true, order: 1 },
    { id: "12302193", name: "Módulo 2", isActive: false, order: 2 },
    { id: "aojdfasid9fcc-12", name: "Módulo 3", isActive: false, order: 3 },
    { id: "asd213123-12", name: "Módulo 4", isActive: false, order: 4 },
  ];

  const handleModuleClick = (moduloslug: string) => {
    router.push(`/coursepage/${slug}/modulopage/${moduloslug}`);
  };

  return (
    <div className="w-full max-w-md bg-zinc-800 text-white p-6 rounded-lg">
      <div className="w-full mb-6 flex items-center justify-between">
        <h2 className="text-lg font-normal mb-1">
          Curso: Arquitetura de Software
        </h2>
        <p className="text-sm text-zinc-400">
          Módulos Concluidos: 0/{modules.length}
        </p>
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
              <span className="w-6 text-center text-sm">{module.order}</span>
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
