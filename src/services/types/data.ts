import {
  FilterOperatorAll,
  FilterOperatorBool,
  FilterOperatorCommon,
  FilterOperatorDate,
  FilterOperatorNumber,
  FilterOperatorText,
} from "@/services/consts/explorer";
import { ApiLinks, PaginationMeta } from "./shared";

export interface DataRow {
  __id: number;
  [key: string]: string | number | boolean | null;
}

export interface PaginatedDataResponse<T extends DataRow = DataRow> {
  data: T[];
  links: ApiLinks;
  meta: PaginationMeta;
}

interface ApiDatabaseErrorDetail {
  code: string;
  details: string | null;
  hint: string | null;
  message: string;
}

interface ApiDatabaseErrorItem {
  code: string | null;
  title: string;
  detail: ApiDatabaseErrorDetail;
}

export interface ApiValidationErrorResponse {
  errors: ApiDatabaseErrorItem[];
}

interface ResourceDataResponseOk {
  status: 200;
  data: PaginatedDataResponse;
  error?: never;
  errors?: never;
}

interface ResourceDataResponseValidationError {
  status: 400 | 500;
  data?: never;
  error: string;
  errors: ApiDatabaseErrorItem[];
}

interface ResourceDataResponseNotFound {
  status: 404;
  data?: never;
  error: string;
  errors?: never;
}

interface ResourceDataResponseGenericError {
  status: Exclude<number, 200 | 400 | 404 | 500> | (number & {});
  data?: never;
  error: string;
  errors?: ApiDatabaseErrorItem[];
}

export type ResourceDataResponse =
  | ResourceDataResponseOk
  | ResourceDataResponseValidationError
  | ResourceDataResponseNotFound
  | ResourceDataResponseGenericError;

// -----------------------------------------------------------------------

export type FilterOperatorCommonType = (typeof FilterOperatorCommon)[number];

export type FilterOperatorTextType = (typeof FilterOperatorText)[number];

export type FilterOperatorNumberType = (typeof FilterOperatorNumber)[number];

export type FilterOperatorDateType = (typeof FilterOperatorDate)[number];

export type FilterOperatorBoolType = (typeof FilterOperatorBool)[number];

export type FilterOperatorType = (typeof FilterOperatorAll)[number];

// -----------------------------------------------------------------------

export type SortType = "string" | "numeric" | "date";
