import { describe, expect, it } from "vitest";
import { stripLocale } from "@/utils/stripLocale";

describe("stripLocale", () => {
  it("removes a supported locale prefix", () => {
    expect(stripLocale("/pt/explorer/123")).toBe("/explorer/123");
    expect(stripLocale("/en/explorer/123")).toBe("/explorer/123");
  });

  it("returns the root for a locale-only path", () => {
    expect(stripLocale("/pt")).toBe("/");
  });

  it("keeps paths without a supported locale", () => {
    expect(stripLocale("/fr/explorer")).toBe("/fr/explorer");
    expect(stripLocale("/explorer")).toBe("/explorer");
  });

  it("returns the root for empty values", () => {
    expect(stripLocale(null)).toBe("/");
    expect(stripLocale(undefined)).toBe("/");
    expect(stripLocale("")).toBe("/");
  });
});
