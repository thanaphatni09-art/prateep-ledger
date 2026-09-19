import {
  agingBucketLabel,
  dateToTimestamp,
  daysBetween,
  formatSatang,
  formatTHB,
  formatThaiDate,
  formatThaiDateLong,
  formatThaiDateTime,
  fromDateInputValue,
  parseBahtToSatang,
  timestampToDate,
  toDateInputValue,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("formatSatang", () => {
  it("formats whole baht with two decimal places", () => {
    expect(formatSatang(0n)).toBe("0.00");
    expect(formatSatang(100n)).toBe("1.00");
    expect(formatSatang(1234567n)).toBe("12,345.67");
  });

  it("groups thousands and keeps satang", () => {
    expect(formatSatang(100000000n)).toBe("1,000,000.00");
    expect(formatSatang(999n)).toBe("9.99");
  });

  it("handles negative amounts", () => {
    expect(formatSatang(-1234567n)).toBe("-12,345.67");
  });

  it("treats null and undefined as zero", () => {
    expect(formatSatang(null)).toBe("0.00");
    expect(formatSatang(undefined)).toBe("0.00");
  });
});

describe("formatTHB", () => {
  it("prefixes the baht symbol", () => {
    expect(formatTHB(1234567n)).toBe("฿12,345.67");
    expect(formatTHB(0n)).toBe("฿0.00");
  });
});

describe("parseBahtToSatang", () => {
  it("parses plain and grouped baht strings", () => {
    expect(parseBahtToSatang("123")).toBe(12300n);
    expect(parseBahtToSatang("1,234.50")).toBe(123450n);
    expect(parseBahtToSatang("฿99.9")).toBe(9990n);
  });

  it("pads a single decimal digit to satang", () => {
    expect(parseBahtToSatang("1.5")).toBe(150n);
  });

  it("parses negative amounts", () => {
    expect(parseBahtToSatang("-12.34")).toBe(-1234n);
  });

  it("rejects unparseable input", () => {
    expect(parseBahtToSatang("")).toBeNull();
    expect(parseBahtToSatang("abc")).toBeNull();
    expect(parseBahtToSatang("1.234")).toBeNull();
  });

  it("round-trips with formatSatang", () => {
    const satang = 987654n;
    expect(parseBahtToSatang(formatSatang(satang))).toBe(satang);
  });
});

describe("timestamp conversion", () => {
  it("converts a nanosecond timestamp to a Date", () => {
    const date = new Date("2026-09-19T00:00:00.000Z");
    const timestamp = BigInt(date.getTime()) * 1_000_000n;
    expect(timestampToDate(timestamp)?.getTime()).toBe(date.getTime());
  });

  it("returns null for missing timestamps", () => {
    expect(timestampToDate(null)).toBeNull();
    expect(timestampToDate(undefined)).toBeNull();
  });

  it("round-trips dateToTimestamp", () => {
    const date = new Date("2026-01-02T03:04:05.000Z");
    expect(timestampToDate(dateToTimestamp(date))?.getTime()).toBe(
      date.getTime(),
    );
  });
});

describe("Thai date formatting", () => {
  const timestamp = BigInt(new Date(2026, 8, 19, 14, 5).getTime()) * 1_000_000n;

  it("formats a short Thai date with the Buddhist year", () => {
    expect(formatThaiDate(timestamp)).toBe("19 ก.ย. 2569");
  });

  it("formats a long Thai date with the Buddhist year", () => {
    expect(formatThaiDateLong(timestamp)).toBe("19 กันยายน 2569");
  });

  it("formats a Thai date and time", () => {
    expect(formatThaiDateTime(timestamp)).toBe("19 ก.ย. 2569 14:05");
  });

  it("renders an em dash for missing timestamps", () => {
    expect(formatThaiDate(null)).toBe("—");
    expect(formatThaiDateLong(undefined)).toBe("—");
    expect(formatThaiDateTime(null)).toBe("—");
  });
});

describe("date input helpers", () => {
  it("formats a Date as yyyy-MM-dd", () => {
    expect(toDateInputValue(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("parses yyyy-MM-dd at local midnight", () => {
    const parsed = fromDateInputValue("2026-01-05");
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(0);
    expect(parsed?.getDate()).toBe(5);
  });

  it("returns null for an empty or malformed value", () => {
    expect(fromDateInputValue("")).toBeNull();
    expect(fromDateInputValue("not-a-date")).toBeNull();
  });

  it("round-trips through the input value", () => {
    const date = new Date(2026, 11, 31);
    expect(fromDateInputValue(toDateInputValue(date))?.getTime()).toBe(
      date.getTime(),
    );
  });
});

describe("daysBetween", () => {
  it("counts whole days between two dates", () => {
    expect(daysBetween(new Date(2026, 0, 1), new Date(2026, 0, 31))).toBe(30);
  });

  it("floors partial days", () => {
    expect(
      daysBetween(new Date(2026, 0, 1, 0, 0), new Date(2026, 0, 1, 23, 59)),
    ).toBe(0);
  });
});

describe("agingBucketLabel", () => {
  it("maps every bucket to its Thai label", () => {
    expect(agingBucketLabel("current")).toBe("ยังไม่ครบกำหนด");
    expect(agingBucketLabel("days1to30")).toBe("1–30 วัน");
    expect(agingBucketLabel("days31to60")).toBe("31–60 วัน");
    expect(agingBucketLabel("days61to90")).toBe("61–90 วัน");
    expect(agingBucketLabel("over90")).toBe("เกิน 90 วัน");
  });

  it("passes through an unknown bucket", () => {
    expect(agingBucketLabel("mystery")).toBe("mystery");
  });
});
