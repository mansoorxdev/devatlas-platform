import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Reusable utility to dynamically merge Tailwind class names,
 * resolving conflicts cleanly.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
