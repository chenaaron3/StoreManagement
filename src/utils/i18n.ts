import i18n from "@/i18n/config";

/**
 * Format currency based on current locale
 */
export function formatCurrency(value: number): string {
  const locale = i18n.language === "ja" ? "ja-JP" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency with compact notation (M for millions, k for thousands)
 */
export function formatCurrencyCompact(value: number): string {
  const locale = i18n.language === "ja" ? "ja-JP" : "en-US";
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "JPY",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

  // For Japanese locale, replace "円" with "¥" to maintain consistency
  return i18n.language === "ja" ? formatted.replace("円", "¥") : formatted;
}

/**
 * Format number based on current locale
 */
export function formatNumber(value: number): string {
  const locale = i18n.language === "ja" ? "ja-JP" : "en-US";
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format date based on current locale
 */
export function formatDate(date: Date): string {
  const locale = i18n.language === "ja" ? "ja-JP" : "en-US";
  return new Intl.DateTimeFormat(locale).format(date);
}

/**
 * Get current locale for number formatting (e.g., 'ja-JP', 'en-US')
 */
export function getLocale(): string {
  return i18n.language === "ja" ? "ja-JP" : "en-US";
}
