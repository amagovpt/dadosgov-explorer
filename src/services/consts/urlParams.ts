export const VIEW_URL_PARAM = "view" as const;

export const CHART_PAGE_URL_PARAM = "chart_page" as const;

export const CHART_URL_PARAMS = {
  type: "chart",
  x: "chart_x",
  y: "chart_y",
  r: "chart_r",
} as const;

export const CHART_URL_PARAM_KEYS: string[] = Object.values(CHART_URL_PARAMS);

export const RESERVED_URL_PARAMS: string[] = [
  "page",
  "page_size",
  CHART_PAGE_URL_PARAM,
  "columns",
  VIEW_URL_PARAM,
  ...CHART_URL_PARAM_KEYS,
];
