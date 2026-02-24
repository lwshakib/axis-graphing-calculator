// Utility for conditional class name merging
import { clsx, type ClassValue } from "clsx";
// Utility to merge Tailwind CSS classes and handle conflicts
import { twMerge } from "tailwind-merge";

/**
 * A utility function that combines clsx and tailwind-merge.
 * It allows for conditional classes and ensures that Tailwind classes are merged
 * correctly (e.g., overriding padding classes).
 *
 * @param inputs - Array of class names, objects, or arrays to be merged.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
