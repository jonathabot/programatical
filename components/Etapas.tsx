"use client";

import React, { useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";

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
  const [palavrasasSelecionadas, setPalavrasSelecionadas] = useState<
    number[] | null
  >(null);

  return (
    <div className="w-full h-full flex flex-col justify-evenly">
      <h3 className="text-lg font-medium text-center">{enunciado}</h3>

      <div className="w-full rounded-lg h-[200px] bg-stone-300 border border-zinc-700 flex items-center justify-center text-center">
        <span className="text-md text-stone-500">
          Arraste uma palavra até aqui.
        </span>
      </div>

      <div className="w-full grid grid-cols-3 gap-4 text-center select-none">
        {palavras.map((palavra) => (
          <div
            key={palavra.id}
            className="flex items-center justify-center bg-white p-2 text-black rounded-lg w-full h-12 cursor-grab leading-3"
          >
            <span>{palavra.palavra}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
