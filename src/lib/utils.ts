import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isSameWeek, isSameYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatChatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isSameWeek(date, new Date())) return format(date, "EEEE");
  if (isSameYear(date, new Date())) return format(date, "MMMM d");
  return format(date, "MMMM d, yyyy");
}

export function formatMonthLabel(dateString: string): string {
  return format(new Date(dateString), "MMMM yyyy");
}

export function groupEntriesByDay(
  entries: { created_at: string }[]
): Map<string, typeof entries> {
  const map = new Map<string, typeof entries>();
  for (const entry of entries) {
    const day = format(new Date(entry.created_at), "yyyy-MM-dd");
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(entry);
  }
  return map;
}

export function groupDaysByMonth(
  days: string[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const day of days) {
    const month = format(new Date(day), "MMMM yyyy");
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(day);
  }
  return map;
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
