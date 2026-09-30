"use client";

import { useTranslation } from "react-i18next";
import { useDataContext } from "@/hooks/useDataContext";
import { useChartContext } from "@/hooks/useChartContext";
import { useViewContext } from "@/hooks/useViewContext";
import { twJoin } from "tailwind-merge";
import ChartSelectors from "../Chart/ChartSelectors";
import ChartRenderer from "../Chart/ChartRenderer";
import ChartPagination from "../Chart/ChartPagination";

export default function ChartView() {
  const { t: te } = useTranslation("explorer");
  const { data } = useDataContext();
  const { hasNumericData } = useChartContext();
  const { isFullscreen } = useViewContext();

  const hasData = (data?.data ?? []).length > 0;

  if (!hasData) {
    return (
      <p className="flex items-center justify-center py-64 rounded-lg border border-neutral-200 bg-white text-m-regular text-neutral-500">
        {te("views.chart.noData")}
      </p>
    );
  }

  if (!hasNumericData) {
    return (
      <p className="flex items-center justify-center py-64 rounded-lg border border-neutral-200 bg-white text-m-regular text-neutral-500">
        {te("views.chart.noNumericData")}
      </p>
    );
  }

  return (
    <div
      className={twJoin(
        "flex flex-col gap-32 bg-white",
        isFullscreen && "flex-1 min-h-0",
      )}
    >
      <ChartSelectors />
      <ChartRenderer />
      <ChartPagination />
    </div>
  );
}
