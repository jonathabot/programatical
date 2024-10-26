"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EtapaPerguntaMultiplaEscolha, EtapaTexto } from "@/components/Etapas";

export default function ModuloPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const content =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam. Magna exercitation reprehenderit magna cillum ullamco consequat quis nostrud exercitation excepteur magna. Exercitation occaecat adipisicing irure do sunt amet. Ut nostrud reprehenderit sunt cillum sint consectetur cupidatat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  const question = "O que é arquitetura de software?";
  const options = [
    "A arte de construir edifícios virtuais no mundo digital.",
    "O processo de criar diagramas bonitos e coloridos que ninguém realmente entende.",
    "Uma um quebra-cabeças gigante.",
    "O processo de design e organização de um sistema de software.",
  ];
  const correctAnswer = 3;

  return (
    <div className="flex items-center justify-center p-4 max-w-2xl">
      <div className="w-full text-white overflow-hidden h-2/3">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-md">Etapa {currentStep} (1 de 10)</span>
            <div className="flex flex-col items-end">
              <span className="text-sm">Arquitetura de Software</span>
              <span className="text-sm">Modulo 1</span>
            </div>
          </div>
          <Progress
            value={currentStep * 10}
            className="h-2 bg-zinc-700"
            indicatorColor="bg-green-500"
          />
        </div>
        <div className="px-4">
          {currentStep === 1 ? (
            <EtapaTexto content={content} />
          ) : (
            <EtapaPerguntaMultiplaEscolha
              question={question}
              options={options}
              correctAnswer={correctAnswer}
              onSelect={setSelectedAnswer}
            />
          )}
        </div>
        <div className="flex justify-around p-4 border-t border-zinc-700 mt-4">
          <Button
            variant="outline"
            className="text-white border-zinc-700 hover:bg-zinc-700"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          >
            {currentStep === 1 ? "Sair" : "Anterior"}
          </Button>
          <Button
            className="bg-cyan-500 hover:bg-cyan-600"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
