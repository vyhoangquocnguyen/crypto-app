import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "USD", location: string = "en-US"): string {
  return new Intl.NumberFormat(location, {
    style: "currency",
    currency,
  }).format(value);
}
