import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  NumberDictionary,
} from "unique-names-generator";

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
