import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}
