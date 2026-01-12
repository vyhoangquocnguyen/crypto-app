import { clsx, type ClassValue } from "clsx";
import { Time } from "lightweight-charts";
import { twMerge } from "tailwind-merge";

/**
 * Combine multiple class value inputs into a single class string with Tailwind class conflicts resolved.
 *
 * @param inputs - Class value inputs (strings, arrays, or objects) to be normalized and merged
 * @returns The resulting class string with Tailwind classes deduplicated/merged
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric value as a localized currency string or as a plain number string.
 *
 * If `value` is `null`, `undefined`, or `NaN`, returns `"$0.00"` when `showSymbol` is not `false`, otherwise `"0.00"`.
 *
 * @param digits - Number of fraction digits to display; defaults to `2`.
 * @param currency - ISO currency code (e.g., `"USD"`); defaults to `"USD"`.
 * @param showSymbol - When `false`, omit the currency symbol and format as a plain number; defaults to `true`.
 * @returns A localized string representing the formatted value; includes a currency symbol when `showSymbol` is not `false`, otherwise a plain numeric string.
 */
export function formatCurrency(
  value: number | null | undefined,
  digits?: number,
  currency?: string,
  showSymbol?: boolean
) {
  if (value === null || value === undefined || isNaN(value)) {
    return showSymbol !== false ? "$0.00" : "0.00";
  }

  if (showSymbol === undefined || showSymbol === true) {
    return value.toLocaleString(undefined, {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
      minimumFractionDigits: digits ?? 2,
      maximumFractionDigits: digits ?? 2,
    });
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits ?? 2,
    maximumFractionDigits: digits ?? 2,
  });
}

/**
 * Formats a numeric percent change to one decimal place with a trailing percent sign.
 *
 * @param change - Percentage value (e.g., `1.2` for 1.2%); may be `null` or `undefined`.
 * @returns The formatted percentage string (for example, `"1.2%"`). Returns `"0.0%"` if `change` is `null`, `undefined`, or `NaN`.
 */
export function formatPercentage(change: number | null | undefined): string {
  if (change === null || change === undefined || isNaN(change)) {
    return "0.0%";
  }
  const formattedChange = change.toFixed(1);
  return `${formattedChange}%`;
}

/**
 * Produce CSS class names and an icon identifier that reflect whether a numeric value is trending up or down.
 *
 * @param value - Numeric trend indicator; positive means trending up, zero or negative means trending down
 * @returns An object with:
 *   - `textClass`: CSS class for text color
 *   - `bgClass`: CSS class for background color
 *   - `iconClass`: identifier for an up or down icon
 */
export function trendingClasses(value: number) {
  const isTrendingUp = value > 0;

  return {
    textClass: isTrendingUp ? "text-green-400" : "text-red-400",
    bgClass: isTrendingUp ? "bg-green-500/10" : "bg-red-500/10",
    iconClass: isTrendingUp ? "icon-up" : "icon-down",
  };
}

/**
 * Produces a human-friendly relative time string for a given date.
 *
 * @param date - A date input (ISO string, timestamp, or Date) to compare against the current time
 * @returns A relative time string:
 * - `"just now"` for under 60 seconds
 * - `"{N} min"` for under 60 minutes
 * - `"{N} hour"` or `"{N} hours"` for under 24 hours
 * - `"{N} day"` or `"{N} days"` for under 7 days
 * - `"{N} week"` or `"{N} weeks"` for under 4 weeks
 * - a date in `YYYY-MM-DD` format for older timestamps
 */
export function timeAgo(date: string | number | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime(); // difference in ms

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""}`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""}`;

  // Format date as YYYY-MM-DD
  return past.toISOString().split("T")[0];
}

/**
 * Converts an array of OHLC tuples into objects compatible with lightweight-charts and removes consecutive entries with identical timestamps.
 *
 * @param data - Array of OHLC tuples in the form `[timeSec, open, high, low, close]` where `timeSec` is a unix timestamp in seconds.
 * @returns An array of objects with properties `time`, `open`, `high`, `low`, and `close`. Consecutive entries that share the same `time` are removed (only the first is kept). The `time` value is cast to `Time`.
 */
export function convertOHLCData(data: OHLCData[]) {
  return data
    .map((d) => ({
      time: d[0] as Time, // ensure seconds, not ms
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
    }))
    .filter((item, index, arr) => index === 0 || item.time !== arr[index - 1].time);
}

export const ELLIPSIS = "ellipsis" as const;
export const buildPageNumbers = (currentPage: number, totalPages: number): (number | typeof ELLIPSIS)[] => {
  const MAX_VISIBLE_PAGES = 5;

  const pages: (number | typeof ELLIPSIS)[] = [];

  if (totalPages <= MAX_VISIBLE_PAGES) {
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push(ELLIPSIS);
  }

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push(ELLIPSIS);
  }

  pages.push(totalPages);

  return pages;
};