import { describe, expect, it, vi } from "vitest";
import formatNumber from "./formatNumber";

describe("formatNumber", () => {
  it("adds thousands separators", () => {
    expect(formatNumber(1234567)).toBe("1 234 567");
  });

  it("uses a comma as decimal separator", () => {
    expect(formatNumber(1234.5)).toBe("1 234,5");
  });

  it("forces the number of decimal places", () => {
    expect(formatNumber(10, { decimalPlaces: 2 })).toBe("10,00");
    expect(formatNumber(1.236, { decimalPlaces: 2 })).toBe("1,24");
  });

  it("keeps the sign of negative numbers", () => {
    expect(formatNumber(-1234.5)).toBe("-1 234,5");
  });

  it("parses already formatted strings", () => {
    expect(formatNumber("1 234,5")).toBe("1 234,5");
    expect(formatNumber("1234567")).toBe("1 234 567");
  });

  it("supports custom separators", () => {
    expect(formatNumber(1234.5, { thousandsSeparator: ".", decimalSeparator: "," })).toBe(
      "1.234,5"
    );
  });

  it("throws on invalid values", () => {
    expect(() => formatNumber("abc")).toThrow('"abc"');
  });

  it("uses the translated error message when t is given", () => {
    const t = vi.fn(() => "translated error");
    expect(() => formatNumber("abc", { t: t as never })).toThrow("translated error");
    expect(t).toHaveBeenCalledWith("errors.api.invalidNumber", { value: "abc" });
  });
});
