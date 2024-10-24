import React from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Label } from "@radix-ui/react-label";

interface EtapaTextoProps {
  content: string;
}

export function EtapaTexto({ content }: EtapaTextoProps) {
  return (
    <ScrollArea className="h-64 border border-zinc-700 rounded-md bg-white text-black">
      <div className="p-4 text-sm">{content}</div>
    </ScrollArea>
  );
}

interface EtapaPerguntaMultiplaEscolhaProps {
  question: string;
  options: string[];
  correctAnswer: number;
  onSelect: (selectedIndex: number) => void;
}

export function EtapaPerguntaMultiplaEscolha({
  question,
  options,
  correctAnswer,
  onSelect,
}: EtapaPerguntaMultiplaEscolhaProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question}</h3>
      <RadioGroup onValueChange={(value) => onSelect(parseInt(value))}>
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="text-sm">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
