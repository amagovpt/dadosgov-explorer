"use client";

import {
  createContext,
  Dispatch,
  RefObject,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useDataContext } from "@/hooks/useDataContext";
import { useViewContext } from "@/hooks/useViewContext";
import { Chart as ChartJS } from "chart.js";
import { CHART_TYPES_WITH_R, ChartType } from "@/services/types/charts";
import {
  CHART_TYPES,
  CHART_TYPES_SINGLE_DATASET,
} from "@/services/consts/chart";
import { CHART_URL_PARAMS } from "@/services/consts/urlParams";

const DEFAULT_CHART: ChartType = "Line";

const NUMERIC_PYTHON_TYPES = ["int", "float"];

export type ChartContextType = {
  keys: string[];
  numericKeys: string[];

  xAxisKey: string;
  setXAxisKey: Dispatch<string>;
  yAxisKeys: string[];
  setYAxisKeys: Dispatch<string[]>;
  rAxisKey: string;
  setRAxisKey: Dispatch<string>;

  chart: ChartType;
  setChart: Dispatch<ChartType>;
  showR: boolean;
  multipleDatasets: boolean;

  hasNumericData: boolean;


  chartRef: RefObject<ChartJS | null>;
  exportChartAsPng: () => void;
};

export const ChartContext = createContext<ChartContextType | undefined>(
  undefined,
);

export function ChartProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { data: resourceData, structure } = useDataContext();
  const { setExtraUrlParams } = useViewContext();

  const rows = resourceData?.data ?? [];

  const keys = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).filter((k) => k !== "__id");
  }, [rows]);

  const numericKeys = useMemo(
    () =>
      keys.filter((k) =>
        NUMERIC_PYTHON_TYPES.includes(structure?.profile.columns?.[k]?.python_type ?? ""),
      ),
    [keys, structure],
  );

  const [xAxisKey, setXAxisKey] = useState<string>(
    () => searchParams.get(CHART_URL_PARAMS.x) ?? "",
  );
  const [yAxisKeys, setYAxisKeys] = useState<string[]>(() => {
    const param = searchParams.get(CHART_URL_PARAMS.y);
    return param ? param.split(",").filter(Boolean) : [];
  });
  const [rAxisKey, setRAxisKey] = useState<string>(
    () => searchParams.get(CHART_URL_PARAMS.r) ?? "",
  );
  const [chart, setChart] = useState<ChartType>(() => {
    const param = searchParams.get(CHART_URL_PARAMS.type);
    return param && CHART_TYPES.includes(param as ChartType)
      ? (param as ChartType)
      : DEFAULT_CHART;
  });

  const chartRef = useRef<ChartJS | null>(null);

  const showR = CHART_TYPES_WITH_R.includes(chart);
  const multipleDatasets = !CHART_TYPES_SINGLE_DATASET.includes(chart);
  const hasNumericData = numericKeys.length > 0;

  const exportChartAsPng = useCallback(() => {
    const instance = chartRef.current;
    if (!instance) return;

    const originalCanvas = instance.canvas;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = originalCanvas.width;
    tempCanvas.height = originalCanvas.height;

    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(originalCanvas, 0, 0);

    const url = tempCanvas.toDataURL("image/png", 1);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chart.png";
    link.click();
  }, []);

  useEffect(() => {
    if (keys.length === 0 || !xAxisKey) return;

    if (!keys.includes(xAxisKey)) {
      setXAxisKey("");
    }
  }, [keys]);

  useEffect(() => {
    if (numericKeys.length === 0 || yAxisKeys.length === 0) return;

    const validKeys = yAxisKeys.filter((key) => numericKeys.includes(key));

    if (validKeys.length !== yAxisKeys.length) {
      setYAxisKeys(validKeys);
    }
  }, [numericKeys]);

  useEffect(() => {
    if (numericKeys.length === 0 || !rAxisKey) return;

    if (!numericKeys.includes(rAxisKey)) {
      setRAxisKey("");
    }
  }, [numericKeys]);

  useEffect(() => {
    if (!multipleDatasets && yAxisKeys.length > 1) {
      setYAxisKeys([yAxisKeys[0]]);
    }
  }, [multipleDatasets]);

  useEffect(() => {
    setExtraUrlParams({
      [CHART_URL_PARAMS.type]: chart,
      [CHART_URL_PARAMS.x]: xAxisKey,
      [CHART_URL_PARAMS.y]: yAxisKeys.join(","),
      [CHART_URL_PARAMS.r]: showR ? rAxisKey : "",
    });
  }, [chart, xAxisKey, yAxisKeys, rAxisKey, showR, setExtraUrlParams]);

  const value = useMemo(
    () => ({
      keys,
      numericKeys,
      xAxisKey,
      setXAxisKey,
      yAxisKeys,
      setYAxisKeys,
      rAxisKey,
      setRAxisKey,
      chart,
      setChart,
      showR,
      multipleDatasets,
      hasNumericData,
      chartRef,
      exportChartAsPng,
    }),
    [
      keys,
      numericKeys,
      xAxisKey,
      yAxisKeys,
      rAxisKey,
      chart,
      showR,
      multipleDatasets,
      hasNumericData,
      exportChartAsPng,
    ],
  );

  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  );
}
