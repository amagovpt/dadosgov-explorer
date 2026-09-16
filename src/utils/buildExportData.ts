import {
  ColumnProfile,
  DatasetProfileResponse,
  NumericColumnProfile,
} from "@/services/types";

export interface StructureFieldExport {
  name: string;
  type: string;
  format: string;
  score: number;
}

export interface StructureExportData {
  resourceId: string;
  datasetId: string;
  totalItems: number;
  totalColumns: number;
  categoricalColumns: number;
  fields: StructureFieldExport[];
}

export function buildStructureFields(
  columns: DatasetProfileResponse["profile"]["columns"],
): StructureFieldExport[] {
  return Object.entries(columns).map(([name, def]) => ({
    name,
    type: def.python_type,
    format: def.format,
    score: def.score,
  }));
}

export function buildStructureExportData(
  resourceId: string,
  structure: DatasetProfileResponse,
): StructureExportData {
  const { profile, dataset_id } = structure;

  return {
    resourceId,
    datasetId: dataset_id,
    totalItems: profile.total_lines,
    totalColumns: Object.keys(profile.columns).length,
    categoricalColumns: profile.categorical.length,
    fields: buildStructureFields(profile.columns),
  };
}

function isNumericProfile(
  profile: ColumnProfile,
): profile is NumericColumnProfile {
  return "min" in profile;
}

export interface MetricsColumnExport {
  name: string;
  type: string;
  isCategorical: boolean;
  distinct: number;
  missing: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  std?: number;
  topValues: { value: string; count: number }[];
  uniqueValues: string[];
}

export interface MetricsExportData {
  duplicates: string;
  encoding: string;
  separator: string;
  columns: MetricsColumnExport[];
}

export function buildMetricsExportData(
  structure: DatasetProfileResponse,
): MetricsExportData {
  const { profile, columns, categorical, unique_values, nb_duplicates, encoding, separator } =
    structure.profile;

  const categoricalSet = new Set(categorical);

  const columnsExport: MetricsColumnExport[] = Object.entries(profile).map(
    ([name, colProfile]) => {
      const base: MetricsColumnExport = {
        name,
        type: columns[name]?.python_type ?? "—",
        isCategorical: categoricalSet.has(name),
        distinct: colProfile.nb_distinct,
        missing: colProfile.nb_missing_values,
        topValues: colProfile.tops.map((t) => ({
          value: t.value,
          count: t.count,
        })),
        uniqueValues: unique_values[name] ?? [],
      };

      if (isNumericProfile(colProfile)) {
        base.min = colProfile.min;
        base.max = colProfile.max;
        base.mean = colProfile.mean;
        base.std = colProfile.std;
      }

      return base;
    },
  );

  return {
    duplicates: nb_duplicates,
    encoding,
    separator,
    columns: columnsExport,
  };
}
