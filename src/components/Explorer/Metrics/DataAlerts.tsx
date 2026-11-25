"use client";

import { useDataContext } from "@/hooks/useDataContext";
import { TFunction } from "i18next";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Typograph } from "@/components/Shared/Typograph/Typograph";
import { Icon } from "@ama-pt/agora-design-system";
import { twJoin } from "tailwind-merge";
import Pill from "@/components/Shared/Pill/Pill";

const MISSING_THRESHOLD = 0.2;
const SCORE_THRESHOLD = 0.5;
const OUTLIER_THRESHOLD = 3;
const DUPLICATES_THRESHOLD = 0.1;

const ALERT_STYLES = {
  danger: {
    icon: "agora-solid-alert-triangle",
    fill: "fill-danger-600",
    bg: "bg-danger-50",
  },
  warning: {
    icon: "agora-solid-alert-circle",
    fill: "fill-warning-600",
    bg: "bg-warning-50",
  },
} as const;

export type AlertI = {
  type: "warning" | "danger";
  title: string;
  message: string;
  columns?: string[];
};

export function useDataAlerts(te: TFunction<"explorer", undefined>) {
  const { structure } = useDataContext();

  return useMemo(() => {
    const { profile, columns, total_lines, nb_duplicates } = structure.profile;

    const alerts: AlertI[] = [];

    const missingColumns = Object.entries(profile).filter(
      ([, col]) => col.nb_missing_values / total_lines > MISSING_THRESHOLD,
    );

    if (missingColumns.length > 0) {
      alerts.push({
        type: "warning",
        title: te("views.metrics.alerts.title.missingValues"),
        message: te("views.metrics.alerts.message.missingValues", {
          count: missingColumns.length,
          threshold: Math.round(MISSING_THRESHOLD * 100),
        }),
        columns: missingColumns.map(([name]) => name),
      });
    }

    /*const outlierColumns = Object.entries(profile).filter(([, col]) => {
      if (!isNumeric(col) || col.std === 0) return false;

      const min = Number(col.min);
      const max = Number(col.max);
      const mean = Number(col.mean);
      const std = Number(col.std);

      return (
        Math.abs(min - mean) > OUTLIER_THRESHOLD * std ||
        Math.abs(max - mean) > OUTLIER_THRESHOLD * std
      );
    });

    if (outlierColumns.length > 0) {
      alerts.push({
        type: "warning",
        title: te("views.metrics.alerts.title.outliers"),
        message: te("views.metrics.alerts.message.outliers", {
          count: outlierColumns.length,
        }),
        columns: outlierColumns.map(([name]) => name),
      });
    }*/

    const lowScoreColumns = Object.entries(columns).filter(
      ([, col]) => col.score < SCORE_THRESHOLD,
    );

    if (lowScoreColumns.length > 0) {
      alerts.push({
        type: "danger",
        title: te("views.metrics.alerts.title.lowScore"),
        message: te("views.metrics.alerts.message.lowScore", {
          count: lowScoreColumns.length,
          threshold: Math.round(SCORE_THRESHOLD * 100),
        }),
        columns: lowScoreColumns.map(([name]) => name),
      });
    }

    const duplicatesNum = Number(nb_duplicates) || 0;
    const duplicatesRatio = total_lines > 0 ? duplicatesNum / total_lines : 0;

    if (duplicatesRatio > DUPLICATES_THRESHOLD) {
      alerts.push({
        type: "warning",
        title: te("views.metrics.alerts.title.duplicates"),
        message: te("views.metrics.alerts.message.duplicates", {
          percentage: Math.round(duplicatesRatio * 100),
        }),
      });
    }

    return alerts;
  }, [structure, te]);
}

export function DataAlerts({ alerts }: { alerts: AlertI[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-16">
      {alerts.map((alert, idx) => {
        const style = ALERT_STYLES[alert.type];

        return (
          <div
            key={idx}
            className={twJoin("flex flex-row items-start gap-8 p-16", style.bg)}
          >
            <Icon name={style.icon} size={16} className={style.fill} />

            <div className="flex flex-col gap-8">
              <Pill
                variant={alert.type}
                className={twJoin(
                  "w-fit px-16",
                  alert.type ? "text-white" : "text-neutral-900",
                )}
              >
                {alert.title}
              </Pill>

              <Typograph tag="p" className="text-m-bold text-neutral-900">
                {alert.message}
              </Typograph>

              {alert.columns && alert.columns.length > 0 && (
                <ul className="list-disc list-inside pl-8 space-y-8 text-neutral-900">
                  {alert.columns.map((col) => (
                    <li key={col}>{col}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
