"use client";

import { useDataContext } from "@/hooks/useDataContext";
import { useViewContext } from "@/hooks/useViewContext";
import { ViewType } from "@/services/types";
import { exportToCsv } from "@/utils/exportToCsv";
import { exportToJson } from "@/utils/exportToJson";
import {
  buildMetricsExportData,
  buildStructureExportData,
} from "@/utils/buildExportData";
import { useTranslation } from "react-i18next";
import FiltersToogle from "../Filters/FiltersToogle";
import Button from "@/components/Shared/Button/Button";
import { useChartContext } from "@/hooks/useChartContext";
import { useCallback, useMemo } from "react";

export function Divider() {
  return <div className="w-px h-full bg-neutral-700" />;
}

export type ExplorerActionsI = {
  selectedView: ViewType;
};

export default function ExplorerActions({ selectedView }: ExplorerActionsI) {
  const { t: te } = useTranslation("explorer");
  const { isLoadingData, data, resourceId, structure } = useDataContext();
  const { isFullscreen, toggleFullscreen } = useViewContext();
  const { exportChartAsPng } = useChartContext();

  const hasData = !isLoadingData && !!data && data.data.length > 0;

  const handleClickExportCsv = useCallback(() => {
    if (hasData) {
      exportToCsv(data.data);
    }
  }, [hasData, data]);

  const handleClickExportStructureJson = useCallback(() => {
    if (hasData) {
      exportToJson(
        buildStructureExportData(resourceId, structure),
        "structure",
      );
    }
  }, [hasData, resourceId, structure]);

  const handleClickExportMetricsJson = useCallback(() => {
    if (hasData) {
      exportToJson(buildMetricsExportData(structure), "metrics");
    }
  }, [hasData, structure]);

  const viewAction = useMemo(() => {
    switch (selectedView) {
      case "table":
        return (
          <Button
            hasIcon
            trailingIcon="agora-line-download"
            trailingIconHover="agora-line-download"
            title={te("actions.exportCsv")}
            appearance="link"
            disabled={!hasData}
            onClick={handleClickExportCsv}
          >
            {te("actions.exportCsv")}
          </Button>
        );
      case "chart":
        return (
          <Button
            hasIcon
            trailingIcon="agora-line-download"
            trailingIconHover="agora-line-download"
            title={te("actions.exportChart")}
            appearance="link"
            disabled={!hasData}
            onClick={exportChartAsPng}
          >
            {te("actions.exportChart")}
          </Button>
        );
      case "structure":
      case "metrics":
        return (
          <Button
            hasIcon
            trailingIcon="agora-line-download"
            trailingIconHover="agora-line-download"
            title={te("actions.exportJson")}
            appearance="link"
            disabled={!hasData}
            onClick={
              selectedView === "structure"
                ? handleClickExportStructureJson
                : handleClickExportMetricsJson
            }
          >
            {te("actions.exportJson")}
          </Button>
        );
      default:
        return null;
    }
  }, [
    selectedView,
    hasData,
    te,
    handleClickExportCsv,
    handleClickExportStructureJson,
    handleClickExportMetricsJson,
    exportChartAsPng,
  ]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center lg:justify-end w-full lg:w-auto">
      <div className="grow">
        <FiltersToogle />
      </div>

      <div className="w-full lg:w-auto flex flex-col md:flex-row gap-8">
        <Button
          hasIcon
          trailingIcon={
            isFullscreen ? "agora-line-minimize" : "agora-line-maximize"
          }
          trailingIconHover={
            isFullscreen ? "agora-line-minimize" : "agora-line-maximize"
          }
          title={
            isFullscreen
              ? te("actions.exitFullscreen")
              : te("actions.fullscreen")
          }
          appearance="link"
          variant="neutral"
          disabled={!hasData}
          onClick={toggleFullscreen}
        >
          {isFullscreen
            ? te("actions.exitFullscreen")
            : te("actions.fullscreen")}
        </Button>

        <Divider />

        {viewAction}
      </div>
    </div>
  );
}
