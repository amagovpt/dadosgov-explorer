"use client";

import { useDataContext } from "@/hooks/useDataContext";
import { useTranslation } from "react-i18next";
import { DataAlerts, useDataAlerts } from "../Metrics/DataAlerts";
import ColumnCard from "../Metrics/ColumnCard";
import FileCard, { FileCardI } from "@/components/Shared/Card/FileCard";

export default function MetricsView() {
  const { structure } = useDataContext();
  const { t: te } = useTranslation("explorer");

  const { profile, columns, categorical, unique_values, nb_duplicates, encoding, separator } =
    structure.profile;
  const columnEntries = Object.entries(profile);
  const categoricalSet = new Set(categorical);

  const alerts = useDataAlerts(te);

  const summaryItems: FileCardI[] = [
    {
      icon: "agora-line-copy",
      label: te("views.metrics.duplicates"),
      value: nb_duplicates,
    },
    {
      icon: "agora-line-file",
      label: te("views.metrics.encoding"),
      value: encoding ?? "-",
    },
    {
      icon: "agora-line-layers-menu",
      label: te("views.metrics.separator"),
      value: (separator === "," ? "vírgula" : separator === "\t" ? "tab" : separator) ?? "-",
    },
  ];

  const labels = {
    distinct: te("views.metrics.distinct"),
    missing: te("views.metrics.missing"),
    min: te("views.metrics.min"),
    max: te("views.metrics.max"),
    mean: te("views.metrics.mean"),
    std: te("views.metrics.std"),
    topValues: te("views.metrics.topValues"),
    uniqueValues: te("views.metrics.uniqueValues"),
    categorical: te("views.metrics.categorical"),
  };

  if (columnEntries.length === 0) {
    return <p className="text-m-regular text-neutral-500">{te("views.metrics.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-32">
      <DataAlerts alerts={alerts} />

      <div className="grid grid-cols-1 gap-32 sm:grid-cols-3">
        {summaryItems.map((item) => (
          <FileCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-32">
        {columnEntries.map(([name, colProfile]) => (
          <ColumnCard
            key={name}
            name={name}
            type={columns[name]?.python_type ?? "—"}
            profile={colProfile}
            isCategorical={categoricalSet.has(name)}
            uniqueValues={unique_values[name] ?? []}
            labels={labels}
          />
        ))}
      </div>
    </div>
  );
}
