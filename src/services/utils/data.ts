import {
  FilterOperatorBool,
  FilterOperatorCommon,
  FilterOperatorDate,
  FilterOperatorNumber,
  FilterOperatorText,
} from "../consts/explorer";
import { DatasetProfileResponse, FilterOperatorType, SortType } from "../types";

export type DataType = {
  format: string;
  pythonType: string;
};

export function getDataType(header: string, structure: DatasetProfileResponse | null): DataType {
  const column = structure?.profile.columns?.[header];
  return {
    format: column?.format ?? "string",
    pythonType: column?.python_type ?? "string",
  };
}

export function getOperatorOptions(dataType: DataType) {
  // format-specific operators take priority
  switch (dataType.format) {
    case "year":
    case "date":
    case "datetime_naive":
      return [...FilterOperatorDate];
    case "bool":
      return [...FilterOperatorBool];
    case "iso_country_code_alpha2":
    case "url":
    case "latlon_wgs":
    case "latitude_wgs":
    case "longitude_wgs":
    case "pays":
      return [...FilterOperatorText];
  }

  // fallback to python_type
  switch (dataType.pythonType) {
    case "int":
    case "float":
      return [...FilterOperatorNumber];
    case "date":
    case "datetime":
      return [...FilterOperatorDate];
    case "bool":
      return [...FilterOperatorBool];
    case "string":
      return [...FilterOperatorText];
    default:
      return [...FilterOperatorCommon];
  }
}

export function getSortType(dataType: DataType): SortType {
  // format-specific types take priority, same as getOperatorOptions
  switch (dataType.format) {
    case "year":
    case "date":
    case "datetime_naive":
      return "date";
  }

  switch (dataType.pythonType) {
    case "int":
    case "float":
      return "numeric";
    case "date":
    case "datetime":
      return "date";
    default:
      return "string";
  }
}

export function getInitialOperator(
  header: string,
  structure: DatasetProfileResponse | null
): FilterOperatorType {
  const dataType = getDataType(header, structure);
  return (getOperatorOptions(dataType)?.at(0) ?? FilterOperatorCommon[0]) as FilterOperatorType;
}

export function toBoolean(value: boolean | string | null | undefined): boolean | null {
  if (value === null || value === undefined || value === "null" || value === "") return null;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
}
