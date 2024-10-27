"use client";

import React, { useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";
import { CheckCircle2 } from "lucide-react";

interface EtapaTextoProps {
  content: string;
}

interface EtapaPerguntaMultiplaEscolhaProps {
  pergunta: {
    enunciado: string;
    opcoes: { id: number; resposta: string }[];
    idOpcaoCorreta: number;
  };
  isVerified: boolean;
  onSelect: (selectedOptionId: number) => void;
}

interface EtapaArrasta {
  pergunta: {
    enunciado: string;
    palavras: { id: number; palavra: string }[];
    idsPalavrasCorretas: number[];
  };
  isVerified: boolean;
  onSelect: (selectedOptionId: number) => void;
}

interface opcao {
  id: number;
  resposta: string;
}

export function EtapaTexto({ content }: EtapaTextoProps) {
  return (
    <ScrollArea className="border border-zinc-700 rounded-md bg-white text-black">
      <div className="p-4 text-md">{content}</div>
    </ScrollArea>
  );
}

export function EtapaPerguntaMultiplaEscolha({
  pergunta,
  isVerified,
  onSelect,
}: EtapaPerguntaMultiplaEscolhaProps) {
  const { enunciado, opcoes, idOpcaoCorreta } = pergunta;
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(
    null
  );

  return (
    <div className="w-full h-full flex flex-col justify-evenly">
      <h3 className="text-lg font-medium text-center">{enunciado}</h3>
      <RadioGroup
        onValueChange={(value) => {
          setRespostaSelecionada(parseInt(value));
          onSelect(parseInt(value));
        }}
        className="w-full"
        disabled={isVerified}
      >
        {opcoes.map((option: opcao) => (
          <div key={option.id}>
            <RadioGroupItem
              value={option.id.toString()}
              id={`option-${option.id}`}
            />
            <Label
              htmlFor={`option-${option.id}`}
              className={`flex items-center justify-center text-center rounded-lg h-[75px] text-black text-sm select-none 
              ${!isVerified ? "hover:cursor-pointer" : ""}
              ${
                respostaSelecionada === option.id && !isVerified
                  ? "bg-cyan-500"
                  : ""
              }
              ${
                respostaSelecionada === option.id &&
                isVerified &&
                respostaSelecionada === idOpcaoCorreta
                  ? "bg-green-500"
                  : ""
              }
              ${
                respostaSelecionada === option.id &&
                isVerified &&
                respostaSelecionada !== idOpcaoCorreta
                  ? "bg-red-500"
                  : ""
              }
              ${respostaSelecionada !== option.id ? "bg-white" : ""}
              `}
            >
              {option.resposta}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

export function EtapaPerguntaArraste({
  pergunta,
  isVerified,
  onSelect,
}: EtapaArrasta) {
  const { enunciado, palavras, idsPalavrasCorretas } = pergunta;
  const [palavrasSelecionadas, setPalavrasSelecionadas] = useState<
    { id: number; palavra: string }[]
  >([]);

  const isCorreta = (id: number) => idsPalavrasCorretas.includes(id);

  return (
    <div className="w-full h-full flex flex-col justify-evenly">
      <h3 className="text-lg font-medium text-center">{enunciado}</h3>

      <div className="w-full grid grid-cols-3 gap-4 text-center select-none rounded-lg bg-stone-300 border border-zinc-700 p-4 h-1/3 items-center">
        {palavrasSelecionadas.length > 0 ? (
          palavrasSelecionadas.map((palavra) => (
            <div
              key={palavra.id}
              className={`flex items-center justify-center p-2 text-black rounded-lg leading-3 h-12 ${
                isVerified
                  ? isCorreta(palavra.id)
                    ? "bg-green-500"
                    : "bg-red-500"
                  : "bg-white"
              }`}
            >
              <span>{palavra.palavra}</span>
            </div>
          ))
        ) : (
          <span className="text-md text-stone-500 col-span-3">
            Selecione uma palavra.
          </span>
        )}
      </div>

      <div className="w-full grid grid-cols-3 gap-4 p-4 text-center select-none h-1/3">
        {palavras
          .filter(
            (palavra) => !palavrasSelecionadas.some((p) => p.id === palavra.id)
          )
          .map((palavra) => (
            <div
              key={palavra.id}
              className="flex items-center justify-center bg-white p-2 text-black rounded-lg w-full h-12 cursor-pointer leading-3"
              onClick={() => {
                setPalavrasSelecionadas([...palavrasSelecionadas, palavra]);
                onSelect(palavra.id);
              }}
            >
              <span>{palavra.palavra}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function AulaConcluida() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold">Aula concluída!</span>
    </div>
  );
}
