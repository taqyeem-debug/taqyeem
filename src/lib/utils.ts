import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), 'EEEE، dd MMMM yyyy - hh:mm a', { locale: ar });
  } catch (e) {
    return dateStr;
  }
}
