import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeWhatsAppNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function capitalizeFirstLetter(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
