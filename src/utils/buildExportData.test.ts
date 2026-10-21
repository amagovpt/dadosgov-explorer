import { describe, expect, it } from "vitest";
import { structure } from "@/test/mock-data";
import { buildMetricsExportData, buildStructureExportData } from "./buildExportData";

describe("buildStructureExportData", () => {
  it("summarises the resource structure", () => {
    const result = buildStructureExportData("resource-1", structure);

    expect(result).toMatchObject({
      resourceId: "resource-1",
      datasetId: "5fbfee44454ae3e3dfcab2c5",
      totalItems: 1219,
      totalColumns: 9,
      categoricalColumns: 6,
    });
    expect(result.fields).toContainEqual({ name: "id_c", type: "int", format: "int", score: 1 });
  });
});

describe("buildMetricsExportData", () => {
  it("includes the global metrics", () => {
    const result = buildMetricsExportData(structure);

    expect(result).toMatchObject({ duplicates: 0, encoding: "utf-8", separator: "," });
    expect(result.columns).toHaveLength(9);
  });

  it("exports text columns without numeric stats", () => {
    const tipo = buildMetricsExportData(structure).columns.find((c) => c.name === "tipo");

    expect(tipo).toMatchObject({
      type: "string",
      isCategorical: true,
      distinct: 0,
      missing: 0,
      topValues: [],
      uniqueValues: [],
    });
    expect(tipo).not.toHaveProperty("min");
  });

  it("exports numeric stats for numeric columns", () => {
    const nContentores = buildMetricsExportData(structure).columns.find(
      (c) => c.name === "n_contentores"
    );

    expect(nContentores).toMatchObject({
      type: "int",
      isCategorical: true,
      distinct: 9,
      min: "0",
      max: "15",
      mean: 1.7112387202625103,
    });
    expect(nContentores?.topValues[0]).toEqual({ value: "1", count: 580 });
    expect(nContentores?.uniqueValues).toContain("15");
  });

  it("marks non categorical columns", () => {
    const idC = buildMetricsExportData(structure).columns.find((c) => c.name === "id_c");

    expect(idC?.isCategorical).toBe(false);
  });
});
