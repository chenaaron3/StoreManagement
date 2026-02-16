import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { formatCurrency as formatCurrencyI18n, formatNumber as formatNumberI18n } from "@/utils/i18n"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return formatCurrencyI18n(value)
}

export function formatNumber(value: number): string {
  return formatNumberI18n(value)
}
