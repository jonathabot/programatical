"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AulaConcluida,
  EtapaPerguntaArraste,
  EtapaPerguntaMultiplaEscolha,
  EtapaTexto,
} from "@/components/Etapas";
import { useParams, useRouter } from "next/navigation";

const aulaSlugEtapas = {
  etapas: [
    {
      id: 1,
      tipo: "texto",
      conteudo:
        "A arquitetura de software é o alicerce para o desenvolvimento e a organização de sistemas complexos. Ela define a estrutura geral de um sistema, determinando como os componentes e subsistemas interagem para atender às demandas funcionais e não funcionais, como desempenho, segurança e manutenibilidade. Uma boa arquitetura de software separa responsabilidades e facilita a evolução do sistema, permitindo que as equipes desenvolvam partes independentes sem impactar o todo.",
      enunciado: null,
      opcoes: null,
      idOpcaoCorreta: null,
      palavras: null,
      idsPalavrasCorretas: null,
    },
    {
      id: 2,
      tipo: "pergunta-multipla-escolha",
      conteudo: null,
      enunciado: "O que é arquitetura de software?",
      opcoes: [
        {
          id: 1,
          resposta: "A arte de construir edifícios virtuais no mundo digital.",
        },
        {
          id: 2,
          resposta:
            "O processo de criar diagramas bonitos e coloridos que ninguém realmente entende.",
        },
        {
          id: 3,
          resposta: "Uma um quebra-cabeças gigante.",
        },
        {
          id: 4,
          resposta:
            "O processo de design e organização de um sistema de software.",
        },
      ],
      idOpcaoCorreta: 4,
      palavras: null,
      idsPalavrasCorretas: null,
    },
    {
      id: 3,
      tipo: "pergunta-arraste",
      conteudo: null,
      enunciado:
        "Quais dessas palavras-chaves tem referencia a arquitetura de software?",
      opcoes: [
        {
          id: 1,
          resposta: "A arte de construir edifícios virtuais no mundo digital.",
        },
        {
          id: 2,
          resposta:
            "O processo de criar diagramas bonitos e coloridos que ninguém realmente entende.",
        },
        {
          id: 3,
          resposta: "Uma um quebra-cabeças gigante.",
        },
        {
          id: 4,
          resposta:
            "O processo de design e organização de um sistema de software.",
        },
      ],
      idOpcaoCorreta: 4,
      palavras: [
        {
          id: 1,
          palavra: "Design",
        },
        {
          id: 2,
          palavra: "Organização",
        },
        {
          id: 3,
          palavra: "Desempenho",
        },
        {
          id: 4,
          palavra: "Edificios virtuais",
        },
        {
          id: 5,
          palavra: "Diagramas bonitos",
        },
        {
          id: 6,
          palavra: "Quebra-cabeça",
        },
      ],
      idsPalavrasCorretas: [2, 3],
    },
  ],
};

export default function ModuloPage() {
  const router = useRouter();
  const { slug, moduloslug } = useParams();

  const handleExitAula = () => {
    router.push(`/coursepage/${slug}/modulopage/${moduloslug}`);
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const etapaAtual = aulaSlugEtapas.etapas[currentStep - 1];

  // Verificar se a aula foi concluída
  const isCompleted = currentStep > aulaSlugEtapas.etapas.length;

  // Calcular progresso baseado no número de etapas
  const progressValue = isCompleted
    ? 100
    : ((currentStep - 1) / (aulaSlugEtapas.etapas.length - 1)) * 95;

  return (
    <div className="flex items-center justify-center p-4 w-1/2">
      <div className="w-full text-white h-full">
        <div className="h-[10%]">
          <div className="flex items-end justify-between">
            <span className="text-md">
              {!isCompleted
                ? `Etapa ${currentStep} (${currentStep} de ${aulaSlugEtapas.etapas.length}) `
                : "Etapas concluídas!"}
            </span>
            <div className="flex flex-col items-end">
              <span className="text-sm">Arquitetura de Software</span>
              <span className="text-sm">Aula 1</span>
            </div>
          </div>
          <Progress
            value={progressValue}
            className="mt-3 h-2 bg-zinc-700"
            indicatorColor="bg-green-500"
          />
        </div>

        <div className="h-[80%] flex items-center justify-center">
          {isCompleted ? (
            <AulaConcluida />
          ) : etapaAtual.tipo === "texto" ? (
            <EtapaTexto
              content={etapaAtual.conteudo ? etapaAtual.conteudo : ""}
            />
          ) : etapaAtual.tipo === "pergunta-multipla-escolha" ? (
            <EtapaPerguntaMultiplaEscolha
              pergunta={{
                enunciado: etapaAtual.enunciado ? etapaAtual.enunciado : "",
                opcoes: etapaAtual.opcoes ? etapaAtual.opcoes : [],
                idOpcaoCorreta: etapaAtual.idOpcaoCorreta || 0,
              }}
              isVerified={isVerified}
              onSelect={setSelectedAnswer}
            />
          ) : etapaAtual.tipo === "pergunta-arraste" ? (
            <EtapaPerguntaArraste
              pergunta={{
                enunciado: etapaAtual.enunciado ? etapaAtual.enunciado : "",
                palavras: etapaAtual.palavras ? etapaAtual.palavras : [],
                idsPalavrasCorretas: etapaAtual.idsPalavrasCorretas
                  ? etapaAtual.idsPalavrasCorretas
                  : [],
              }}
              isVerified={isVerified}
              onSelect={setSelectedAnswer}
            />
          ) : (
            ""
          )}
        </div>

        <div className="flex justify-around border-t border-zinc-700 h-[10%] items-center">
          <Button
            variant="outline"
            className="text-white border-zinc-700 hover:bg-zinc-700"
            onClick={() =>
              currentStep === 1
                ? handleExitAula()
                : setCurrentStep(Math.max(1, currentStep - 1))
            }
          >
            {currentStep === 1 ? "Sair" : "Anterior"}
          </Button>

          {isCompleted ? (
            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={handleExitAula}
            >
              Próximo
            </Button>
          ) : etapaAtual.tipo !== "texto" && !isVerified ? (
            <Button
              className="bg-slate-600 hover:bg-slate-700"
              onClick={() => setIsVerified(true)}
              disabled={!selectedAnswer}
            >
              Verificar
            </Button>
          ) : (
            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={() => {
                setCurrentStep(currentStep + 1);
                setSelectedAnswer(null);
                setIsVerified(false);
              }}
            >
              {isCompleted ? "Continuar" : "Próximo"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
