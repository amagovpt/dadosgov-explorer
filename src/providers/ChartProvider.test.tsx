import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChartContext } from "@/hooks/useChartContext";
import { data, structure } from "@/test/mock-data";
import { ChartProvider } from "./ChartProvider";
import { DataContext, DataContextType, ViewContext, ViewContextType } from "./ResourceProvider";

const mocks = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));

vi.mock("next/navigation", () => ({ useSearchParams: () => mocks.searchParams }));

const dataValue = { data, structure } as unknown as DataContextType;
const emptyDataValue = { data: null, structure } as unknown as DataContextType;

const setExtraUrlParams = vi.fn();
const viewValue = { setExtraUrlParams } as unknown as ViewContextType;

function renderProvider(query = "", value = dataValue) {
  mocks.searchParams = new URLSearchParams(query);
  return renderHook(useChartContext, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <DataContext.Provider value={value}>
        <ViewContext.Provider value={viewValue}>
          <ChartProvider>{children}</ChartProvider>
        </ViewContext.Provider>
      </DataContext.Provider>
    ),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ChartProvider", () => {
  it("derives the keys from the data", () => {
    const { result } = renderProvider();

    expect(result.current.keys).toEqual([
      "id_c",
      "tipo",
      "n_contentores",
      "capacidade_total",
      "rua",
      "bairro",
      "lugar",
      "dicofre",
      "operador",
    ]);
    expect(result.current.numericKeys).toEqual(["id_c", "n_contentores", "capacidade_total"]);
    expect(result.current.hasNumericData).toBe(true);
  });

  it("does not treat null or digit-only text columns as numeric", () => {
    const { result } = renderProvider();

    expect(result.current.numericKeys).not.toContain("bairro");
    expect(result.current.numericKeys).not.toContain("dicofre");
  });

  it("has no keys without data", () => {
    const { result } = renderProvider("", emptyDataValue);

    expect(result.current.keys).toEqual([]);
    expect(result.current.hasNumericData).toBe(false);
  });

  it("uses the line chart by default", () => {
    const { result } = renderProvider("chart=Unknown");

    expect(result.current.chart).toBe("Line");
    expect(result.current.showR).toBe(false);
    expect(result.current.multipleDatasets).toBe(true);
  });

  it("reads the chart settings from the URL", () => {
    const { result } = renderProvider(
      "chart=Bubble&chart_x=tipo&chart_y=n_contentores,capacidade_total&chart_r=n_contentores"
    );

    expect(result.current).toMatchObject({
      chart: "Bubble",
      showR: true,
      xAxisKey: "tipo",
      yAxisKeys: ["n_contentores", "capacidade_total"],
      rAxisKey: "n_contentores",
    });
  });

  it("writes the chart settings to the URL", () => {
    renderProvider(
      "chart=Bubble&chart_x=tipo&chart_y=n_contentores,capacidade_total&chart_r=n_contentores"
    );

    expect(setExtraUrlParams).toHaveBeenLastCalledWith({
      chart: "Bubble",
      chart_x: "tipo",
      chart_y: "n_contentores,capacidade_total",
      chart_r: "n_contentores",
    });
  });

  it("only writes the r axis for bubble charts", () => {
    renderProvider("chart=Bar&chart_r=n_contentores");

    expect(setExtraUrlParams).toHaveBeenLastCalledWith(expect.objectContaining({ chart_r: "" }));
  });

  it("drops axis keys that are not in the data", () => {
    const { result } = renderProvider("chart_x=missing&chart_y=n_contentores,tipo&chart_r=tipo");

    expect(result.current.xAxisKey).toBe("");
    expect(result.current.yAxisKeys).toEqual(["n_contentores"]);
    expect(result.current.rAxisKey).toBe("");
  });

  it("keeps a single dataset for proportional charts", () => {
    const { result } = renderProvider("chart_y=n_contentores,capacidade_total");

    act(() => result.current.setChart("Pie"));

    expect(result.current.multipleDatasets).toBe(false);
    expect(result.current.yAxisKeys).toEqual(["n_contentores"]);
  });
});
