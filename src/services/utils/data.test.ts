import { describe, expect, it } from "vitest";
import {
  FilterOperatorBool,
  FilterOperatorCommon,
  FilterOperatorDate,
  FilterOperatorNumber,
  FilterOperatorText,
} from "@/services/consts/explorer";
import { structure } from "@/test/mock-data";
import { getDataType, getInitialOperator, getOperatorOptions, toBoolean } from "./data";

describe("getDataType", () => {
  it("returns the column format and python type", () => {
    expect(getDataType("id_c", structure)).toEqual({ format: "int", pythonType: "int" });
  });

  it("falls back to string for unknown columns", () => {
    expect(getDataType("missing", structure)).toEqual({ format: "string", pythonType: "string" });
    expect(getDataType("id_c", null)).toEqual({ format: "string", pythonType: "string" });
  });
});

describe("getOperatorOptions", () => {
  it("gives priority to the format", () => {
    expect(getOperatorOptions({ format: "year", pythonType: "int" })).toEqual([
      ...FilterOperatorDate,
    ]);
    expect(getOperatorOptions({ format: "url", pythonType: "int" })).toEqual([
      ...FilterOperatorText,
    ]);
  });

  it("falls back to the python type", () => {
    expect(getOperatorOptions({ format: "int", pythonType: "int" })).toEqual([
      ...FilterOperatorNumber,
    ]);
    expect(getOperatorOptions({ format: "x", pythonType: "bool" })).toEqual([
      ...FilterOperatorBool,
    ]);
    expect(getOperatorOptions({ format: "x", pythonType: "string" })).toEqual([
      ...FilterOperatorText,
    ]);
  });

  it("returns the common operators for unknown types", () => {
    expect(getOperatorOptions({ format: "x", pythonType: "json" })).toEqual([
      ...FilterOperatorCommon,
    ]);
  });
});

describe("getInitialOperator", () => {
  it("returns the first operator for the column type", () => {
    expect(getInitialOperator("tipo", structure)).toBe("contains");
    expect(getInitialOperator("id_c", structure)).toBe("exact");
  });
});

describe("toBoolean", () => {
  it("converts booleans and their string form", () => {
    expect(toBoolean(true)).toBe(true);
    expect(toBoolean("true")).toBe(true);
    expect(toBoolean(false)).toBe(false);
    expect(toBoolean("false")).toBe(false);
  });

  it("returns null for empty or unknown values", () => {
    expect(toBoolean(null)).toBeNull();
    expect(toBoolean(undefined)).toBeNull();
    expect(toBoolean("null")).toBeNull();
    expect(toBoolean("")).toBeNull();
    expect(toBoolean("yes")).toBeNull();
  });
});
