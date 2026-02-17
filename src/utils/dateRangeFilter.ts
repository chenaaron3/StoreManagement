import { getISOWeek, getISOWeekYear } from 'date-fns';

import type { DateRange } from "react-day-picker";

export function dateToMonthlyKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function dateToWeeklyKey(d: Date): string {
  const year = getISOWeekYear(d);
  const week = String(getISOWeek(d)).padStart(2, "0");
  return `${year}-W${week}`;
}

export function parseMonthlyKey(key: string): Date | null {
  const m = key.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, 1);
}

export function parseWeeklyKey(key: string): Date | null {
  const m = key.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const week = parseInt(m[2], 10);
  const jan4 = new Date(year, 0, 4);
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - jan4.getDay() + 1 + (week - 1) * 7);
  return start;
}

export function filterByDateRange<T extends { date: string }>(
  items: T[],
  range: DateRange | undefined,
  granularity: "weekly" | "monthly",
): T[] {
  if (!range?.from) return items;
  const parseKey = granularity === "weekly" ? parseWeeklyKey : parseMonthlyKey;
  const toKey = granularity === "weekly" ? dateToWeeklyKey : dateToMonthlyKey;
  const startKey = toKey(range.from);
  const endKey = range.to ? toKey(range.to) : startKey;

  return items.filter((item) => {
    const d = parseKey(item.date);
    if (!d) return true;
    const key =
      granularity === "weekly" ? dateToWeeklyKey(d) : dateToMonthlyKey(d);
    return key >= startKey && key <= endKey;
  });
}
