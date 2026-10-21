import { ColumnDefinition, TopValue } from "./shared";

export interface BaseColumnProfile {
  tops: TopValue[];
  nb_distinct: number;
  nb_missing_values: number;
}

export interface NumericColumnProfile extends BaseColumnProfile {
  min: number | string;
  max: number | string;
  mean: number;
  std: number;
}

export type ColumnProfile = BaseColumnProfile | NumericColumnProfile;

export interface DatasetProfile {
  header: string[];
  columns: Record<string, ColumnDefinition>;
  formats: Record<string, string[]>;
  profile: Record<string, ColumnProfile>;
  encoding: string;
  separator: string;
  categorical: string[];
  total_lines: number;
  nb_duplicates: number | string;
  unique_values: Record<string, string[]>;
  columns_fields: Record<string, ColumnDefinition>;
  columns_labels: Record<string, ColumnDefinition>;
  header_row_idx: number;
  heading_columns: number;
  trailing_columns: number;
}

export interface DatasetProfileResponse {
  profile: DatasetProfile;
  deleted_at: string | null;
  dataset_id: string;
  indexes: unknown | null;
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

interface ResourceStructureResponseOk {
  status: 200;
  data: DatasetProfileResponse;
  error?: never;
  errors?: never;
}

export interface ResourceStructureResponseValidationError {
  status: 400 | 500;
  data?: never;
  error: string;
  errors: ApiDatabaseErrorItem[];
}

interface ResourceStructureResponseNotFound {
  status: 404;
  data?: never;
  error: string;
  errors?: never;
}

interface ResourceStructureResponseGenericError {
  status: Exclude<number, 200 | 400 | 404 | 500> | (number & {});
  data?: never;
  error: string;
  errors?: ApiDatabaseErrorItem[];
}

export type ResourceStructureResponse =
  | ResourceStructureResponseOk
  | ResourceStructureResponseValidationError
  | ResourceStructureResponseNotFound
  | ResourceStructureResponseGenericError;
