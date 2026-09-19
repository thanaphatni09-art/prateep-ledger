import type { Satang, Timestamp } from "@/types/app";

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const THAI_MONTHS_LONG = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

/** Convert a backend nanosecond timestamp into a JS Date, or null when invalid. */
export function timestampToDate(
  timestamp: Timestamp | undefined | null,
): Date | null {
  if (timestamp === undefined || timestamp === null) return null;
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Convert a JS Date into a backend nanosecond timestamp. */
export function dateToTimestamp(date: Date): Timestamp {
  return BigInt(date.getTime()) * 1_000_000n;
}

/** Format satang as a Thai baht string, e.g. 1234567n -> "12,345.67". */
export function formatSatang(amount: Satang | undefined | null): string {
  if (amount === undefined || amount === null) return "0.00";
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const baht = abs / 100n;
  const satang = abs % 100n;
  const grouped = baht.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${grouped}.${satang.toString().padStart(2, "0")}`;
}

/** Format satang with the Thai baht symbol, e.g. "฿12,345.67". */
export function formatTHB(amount: Satang | undefined | null): string {
  return `฿${formatSatang(amount)}`;
}

/** Parse a user-typed baht string into satang. Returns null when unparseable. */
export function parseBahtToSatang(value: string): Satang | null {
  const cleaned = value.replace(/[,\s฿]/g, "");
  if (cleaned === "" || !/^-?\d*(\.\d{0,2})?$/.test(cleaned)) return null;
  const negative = cleaned.startsWith("-");
  const [whole, fraction = ""] = (negative ? cleaned.slice(1) : cleaned).split(
    ".",
  );
  const satang =
    BigInt(whole || "0") * 100n + BigInt(fraction.padEnd(2, "0") || "0");
  return negative ? -satang : satang;
}

/** Format a backend timestamp as a Thai short date, e.g. "19 ก.ย. 2569". */
export function formatThaiDate(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear() + 543}`;
}

/** Format a backend timestamp as a Thai long date, e.g. "19 กันยายน 2569". */
export function formatThaiDateLong(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return `${date.getDate()} ${THAI_MONTHS_LONG[date.getMonth()]} ${date.getFullYear() + 543}`;
}

/** Format a backend timestamp as a Thai date and time, e.g. "19 ก.ย. 2569 14:05". */
export function formatThaiDateTime(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${formatThaiDate(timestamp)} ${hours}:${minutes}`;
}

/** Format a JS Date as an ISO yyyy-MM-dd string for date inputs. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse an ISO yyyy-MM-dd date-input value into a Date at local midnight. */
export function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Number of days between two dates, floored. */
export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / 86_400_000);
}

/** Thai label for an aging bucket. */
export function agingBucketLabel(bucket: string): string {
  switch (bucket) {
    case "current":
      return "ยังไม่ครบกำหนด";
    case "days1to30":
      return "1–30 วัน";
    case "days31to60":
      return "31–60 วัน";
    case "days61to90":
      return "61–90 วัน";
    case "over90":
      return "เกิน 90 วัน";
    default:
      return bucket;
  }
}
