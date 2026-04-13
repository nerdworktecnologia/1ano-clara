import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeWhatsAppNumber(input: string) {
  const trimmed = input.trim();
  const rawDigits = input.replace(/\D/g, "");
  if (!rawDigits) return "";

  const digitsBase = trimmed.startsWith("00") ? rawDigits.replace(/^00/, "") : rawDigits;
  const digits = trimmed.startsWith("+") || trimmed.startsWith("00") ? digitsBase : digitsBase.replace(/^0+/, "");
  if (trimmed.startsWith("+") || trimmed.startsWith("00")) return digits;

  if (digits.startsWith("55")) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function capitalizeFirstLetter(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
