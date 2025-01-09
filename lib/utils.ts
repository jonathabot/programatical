import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  NumberDictionary,
} from "unique-names-generator";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomPlaceholderUsername() {
  const numberDictionary = NumberDictionary.generate({
    min: 100,
    max: 999,
  });

  const generatedName: string = uniqueNamesGenerator({
    dictionaries: [adjectives, animals, numberDictionary],
    separator: "",
    style: "capital",
  });

  return generatedName;
}

export function generateShortId() {
  const fullUuid = uuidv4(); // Gera um UUID completo
  return fullUuid.slice(0, 8); // Use os primeiros 8 caracteres do UUID (corte o comprimento conforme necessário)
}
