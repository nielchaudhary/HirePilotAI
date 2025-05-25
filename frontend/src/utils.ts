import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isNullOrUndefined = (value: unknown) =>
  value === null || value === undefined;

export const BASE_URL = "http://localhost:8090/hirepilot/v1";
