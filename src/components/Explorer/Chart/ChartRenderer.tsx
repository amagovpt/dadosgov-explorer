"use client";

import { useMemo, useCallback, ComponentType } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  BubbleController,
  ScatterController,
  LineController,
  BarController,
  RadarController,
  DoughnutController,
  PolarAreaController,
  PieController,
} from "chart.js";
import {
  Line,
  Bar,
  Radar,
  Doughnut,
  PolarArea,
  Bubble,
  Pie,
  Scatter,
} from "react-chartjs-2";
import { useChartContext } from "@/hooks/useChartContext";
import { useDataContext } from "@/hooks/useDataContext";
import { useViewContext } from "@/hooks/useViewContext";
import { ChartType } from "@/services/types/charts";
import { getChartColor } from "@/services/utils/charts";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  LineController,
  BarController,
  RadarController,
  DoughnutController,
  PolarAreaController,
  BubbleController,
  PieController,
  ScatterController,
);

const CHART_COMPONENTS: Record<
  Exclude<ChartType, "Bubble">,
  ComponentType<any>
> = {
  Line,
  Bar,
  Radar,
  Doughnut,
  "Polar Area": PolarArea,
  Pie,
  Scatter,
};

export default function ChartRenderer() {
  const { data: resourceData } = useDataContext();
  const { xAxisKey, yAxisKeys, rAxisKey, chart, chartRef, exportChartAsPng } =
    useChartContext();
  const { isFullscreen } = useViewContext();

  const { t: te } = useTranslation("explorer");

  const rows = useMemo(
    () => (resourceData?.data ?? []).map(({ __id, ...rest }) => rest),
    [resourceData],
  );

  const handleRef = useCallback(
    (instance: ChartJS | undefined | null) => {
      chartRef.current = instance ?? null;
    },
    [chartRef],
  );

  const standardData = useMemo(
    () => ({
      labels: rows.map((d) => d[xAxisKey] ?? ""),
      datasets: yAxisKeys.map((key, index) => {
        const color = getChartColor(index);
        return {
          label: key,
          data: rows.map((d) => Number(d[key])),
          borderColor: color.border,
          backgroundColor: color.background,
        };
      }),
    }),
    [rows, xAxisKey, yAxisKeys],
  );

  const bubbleData = useMemo(
    () => ({
      datasets: yAxisKeys.map((key, index) => {
        const color = getChartColor(index);
        return {
          label: `${key} vs ${xAxisKey}`,
          data: rows.map((d) => ({
            x: Number(d[xAxisKey]),
            y: Number(d[key]),
            r: Number(d[rAxisKey] || 5),
          })),
          borderColor: color.border,
          backgroundColor: color.background,
        };
      }),
    }),
    [rows, xAxisKey, yAxisKeys, rAxisKey],
  );

  if (rows.length === 0 || yAxisKeys.length === 0) {
    return (
      <p className="flex items-center justify-center py-64 rounded-lg border border-neutral-200 bg-white text-m-regular text-neutral-500">
        {te(
          yAxisKeys.length === 0
            ? "views.chart.noAxisSelected"
            : "views.chart.noData",
        )}
      </p>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: !isFullscreen,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  let chartToRender = null;

  if (chart === "Bubble") {
    chartToRender = (
      <Bubble ref={handleRef} data={bubbleData} options={options} />
    );
  } else {
    const Component = CHART_COMPONENTS[chart];
    chartToRender = (
      <Component ref={handleRef} data={standardData} options={options} />
    );
  }

  return (
    <div
      className={twJoin(
        "relative w-full bg-white",
        isFullscreen && "flex-1 min-h-[320px]",
      )}
    >
      {chartToRender}
    </div>
  );
}
