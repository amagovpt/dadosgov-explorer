"use client";

import { getData } from "@/app/[locale]/explorer/[resource_id]/actions";
import {
  FilterOperatorAll,
  INITIAL_PAGE,
  PAGE_SIZES,
  VIEW_TYPES,
} from "@/services/consts/explorer";
import { CHART_URL_PARAM_KEYS, VIEW_URL_PARAM } from "@/services/consts/urlParams";
import {
  DatasetProfileResponse,
  FilterOperatorType,
  PaginatedDataResponse,
  ResourceDataResponse,
  ViewType,
} from "@/services/types";
import { getInitialOperator } from "@/services/utils/data";
import { prepareUrlSearchParams } from "@/utils/urlParams";
import { useToastContext } from "@ama-pt/agora-design-system";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";

export type DataContextType = {
  resourceId: string;

  isLoadingData: boolean;
  loadData: () => void;
  errorData: string | null;
  data: PaginatedDataResponse | null;

  structure: DatasetProfileResponse;

  total: number;
  totalFiltered: number;
};

export type PaginationContextType = {
  page: number;
  setPage: Dispatch<number>;
  pageSize: number;
  setPageSize: Dispatch<number>;

  sortColumn: string | null;
  setSortColumn: Dispatch<string | null>;
  sortDirection: "asc" | "desc" | null;
  setSortDirection: Dispatch<"asc" | "desc" | null>;
};

export type ViewContextType = {
  view: ViewType;
  setView: Dispatch<ViewType>;
  setExtraUrlParams: (params: Record<string, string>) => void;

  isFullscreen: boolean;
  explorerContainerRef: RefObject<HTMLDivElement | null>;
  toggleFullscreen: () => void;
};

export type FiltersContextType = {
  headers: string[];
  headersVisibility: Record<string, boolean>;
  setHeadersVisibility: Dispatch<Record<string, boolean>>;
  nHeadersVisible: number;
  appliedHeadersVisibility: Record<string, boolean>;

  filters: Record<string, any>;
  setFilters: Dispatch<Record<string, any>>;
  removeFilter: (filter: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  filtersOperator: Record<string, FilterOperatorType>;
  setFiltersOperator: Dispatch<Record<string, FilterOperatorType>>;

  invalidFilters: boolean;
  setInvalidFilters: Dispatch<boolean>;

  appliedFilters: Record<string, any>;
  nFiltersApplied: number;
};

export const DataContext = createContext<DataContextType | undefined>(undefined);
export const PaginationContext = createContext<PaginationContextType | undefined>(undefined);
export const ViewContext = createContext<ViewContextType | undefined>(undefined);
export const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export type ResourceProviderI = {
  locale: string;
  resourceId: string;
  structure: DatasetProfileResponse;
  children: ReactNode;
};

export function ResourceProvider({ locale, resourceId, structure, children }: ResourceProviderI) {
  const searchParams = useSearchParams();
  const toastContext = useToastContext();
  const { t } = useTranslation("common");
  const { t: te } = useTranslation("explorer");

  const [isReady, setIsReady] = useState<boolean>(false);

  const [data, setData] = useState<PaginatedDataResponse | null>(null);
  const [errorData, setErrorData] = useState<string | null>(null);

  const [headersVisibility, setHeadersVisibility] = useState<Record<string, boolean>>({});

  const [page, setPage] = useState<number>(INITIAL_PAGE);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);

  const [view, setView] = useState<ViewType>(VIEW_TYPES[0]);

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filtersOperator, setFiltersOperator] = useState<Record<string, FilterOperatorType>>({});

  const [invalidFilters, setInvalidFilters] = useState<boolean>(false);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [isLoadingData, startDataTransition] = useTransition();

  const appliedFilters = useRef<Record<string, any>>({});
  const appliedFiltersOperator = useRef<Record<string, any>>({});
  const appliedHeadersVisibility = useRef<Record<string, boolean>>({});

  const extraUrlParams = useRef<Record<string, string>>({});
  const setUrlParamsRef = useRef<() => void>(() => {});
  const isReadyRef = useRef<boolean>(false);

  const explorerContainerRef = useRef<HTMLDivElement | null>(null);

  const headers: string[] = structure?.profile.header ?? [];
  const nHeaders: number = Object.values(headers).length;
  const nHeadersVisible: number = Object.values(headersVisibility).filter((v) => v === true).length;

  const total: number = structure?.profile.total_lines ?? 0;
  const totalFiltered: number = data?.meta.total ?? 0;
  const nFiltersApplied: number = Object.keys(appliedFilters.current).filter(
    (filter) => !!appliedFilters.current[filter]
  ).length;

  const getColumnsForFilters = useCallback(() => {
    const applied = appliedHeadersVisibility.current;
    const nVisible = Object.values(applied).filter((v) => v === true).length;
    return nVisible < nHeaders ? Object.keys(applied).filter((h) => applied[h] === true) : [];
  }, [nHeaders]);

  const loadData = useCallback(async () => {
    if (!resourceId.trim()) return;

    const columnsForFilters = getColumnsForFilters();

    startDataTransition(async () => {
      setErrorData(null);
      try {
        const response: ResourceDataResponse = await getData(
          locale,
          resourceId,
          page,
          pageSize,
          sortColumn,
          sortDirection,
          headers,
          appliedFiltersOperator.current ?? {},
          appliedFilters.current ?? {},
          columnsForFilters
        );
        if (response.status === 200 && response.data) {
          setData(response.data || { data: [], links: {}, meta: {} });
        } else {
          setData(null);
          setErrorData(
            response.errors?.map((error) => error.detail.hint).join(" ") ||
              te("errors.data.badRequest")
          );
          toastContext.showToast(
            {
              id: +new Date(),
              title: te("errors.data.title"),
              description:
                response.errors?.map((error) => error.detail.hint).join(" ") ||
                te("errors.data.badRequest"),
              type: "failure",
              closeLabel: t("close"),
            },
            5000
          );
        }
      } catch (err) {
        setData(null);
        setErrorData(te("errors.data.failed"));
        toastContext.showToast(
          {
            id: +new Date(),
            title: te("errors.data.title"),
            description: te("errors.data.failed"),
            type: "failure",
            closeLabel: t("close"),
          },
          5000
        );
      }
    });
  }, [
    locale,
    startDataTransition,
    resourceId,
    page,
    pageSize,
    sortColumn,
    sortDirection,
    headers,
    getColumnsForFilters,
  ]);

  const setUrlParams = useCallback(() => {
    const columnsForFilters = getColumnsForFilters();

    const params = prepareUrlSearchParams(
      page,
      pageSize,
      sortColumn,
      sortDirection,
      headers,
      appliedFiltersOperator.current,
      appliedFilters.current ?? {},
      columnsForFilters,
      view,
      extraUrlParams.current
    );
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  }, [page, pageSize, sortColumn, sortDirection, headers, getColumnsForFilters, view]);

  useEffect(() => {
    setUrlParamsRef.current = setUrlParams;
  }, [setUrlParams]);

  const setExtraUrlParams = useCallback((params: Record<string, string>) => {
    const hasChanges = Object.keys(params).some(
      (key) => params[key] !== extraUrlParams.current[key]
    );
    if (!hasChanges) return;

    extraUrlParams.current = { ...extraUrlParams.current, ...params };

    if (isReadyRef.current) {
      setUrlParamsRef.current();
    }
  }, []);

  const removeFilter = useCallback(
    (filter: string) => {
      const { [filter]: _, ...rest } = filters;
      setFilters(rest);
      appliedFilters.current = { ...rest };
      void setUrlParams();
      void loadData();
    },
    [filters, setUrlParams, loadData]
  );

  const applyFilters = useCallback(() => {
    let trimmedFilters = {};
    Object.keys(filters).forEach((key) => {
      trimmedFilters = {
        ...trimmedFilters,
        [key]: String(filters[key]).trim(),
      };
    });

    setFilters(trimmedFilters);
    appliedFilters.current = { ...trimmedFilters };
    appliedFiltersOperator.current = { ...filtersOperator };
    appliedHeadersVisibility.current = { ...headersVisibility };

    setPage(INITIAL_PAGE);

    void setUrlParams();
    void loadData();
  }, [filters, filtersOperator, setUrlParams, loadData, headersVisibility]);

  const clearFilters = useCallback(() => {
    setFilters({});
    appliedFilters.current = {};

    const fo = Object.fromEntries(
      headers.map((h) => [h, getInitialOperator(h, structure)])
    ) as Record<string, FilterOperatorType>;
    const fv = Object.fromEntries(headers.map((h) => [h, true]));

    setFiltersOperator(fo);
    appliedFiltersOperator.current = { ...fo };

    setHeadersVisibility(fv);
    appliedHeadersVisibility.current = { ...fv };

    setPage(INITIAL_PAGE);

    void setUrlParams();
    void loadData();
  }, [headers, setUrlParams, loadData, structure]);

  const toggleFullscreen = useCallback(() => {
    const element = explorerContainerRef.current;
    if (!element) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    let filtersToSet: Record<string, string> = {};
    let operatorsToSet: Record<string, FilterOperatorType> = Object.fromEntries(
      headers.map((h) => [h, getInitialOperator(h, structure)])
    ) as Record<string, FilterOperatorType>;
    let showCol: Record<string, boolean> = Object.fromEntries(headers.map((h) => [h, true]));

    searchParams
      .entries()
      .toArray()
      .forEach((param) => {
        const key = param[0];
        const value = param[1];

        if (CHART_URL_PARAM_KEYS.includes(key)) {
          if (value) {
            extraUrlParams.current = {
              ...extraUrlParams.current,
              [key]: value,
            };
          }
          return;
        }

        switch (key) {
          case "page":
            setPage(value ? Number(value) || INITIAL_PAGE : INITIAL_PAGE);
            break;
          case "page_size": {
            const parsedPageSize = value ? Number(value) : NaN;
            setPageSize(
              PAGE_SIZES.includes(parsedPageSize as (typeof PAGE_SIZES)[number])
                ? parsedPageSize
                : PAGE_SIZES[0]
            );
            break;
          }
          case VIEW_URL_PARAM:
            if (VIEW_TYPES.includes(value as ViewType)) {
              setView(value as ViewType);
            }
            break;
          case "columns": {
            const colsParams = value.split(",");
            showCol = Object.fromEntries(headers.map((h) => [h, colsParams.includes(h)]));
            break;
          }
          default: {
            if (key.endsWith("__sort")) {
              setSortColumn(key.replace("__sort", ""));
              setSortDirection(value === "desc" ? "desc" : "asc");
            } else {
              const operator = FilterOperatorAll.find((candidate) =>
                key.endsWith(`__${candidate}`)
              );

              if (operator) {
                const filterKey = key.replace(`__${operator}`, "");
                filtersToSet = {
                  ...filtersToSet,
                  [filterKey]: value,
                };
                operatorsToSet = {
                  ...operatorsToSet,
                  [filterKey]: operator,
                };
              }
            }
            break;
          }
        }
      });

    setFilters(filtersToSet);
    appliedFilters.current = { ...filtersToSet };
    setFiltersOperator(operatorsToSet);
    appliedFiltersOperator.current = { ...operatorsToSet };
    setHeadersVisibility(showCol);
    appliedHeadersVisibility.current = { ...showCol };

    isReadyRef.current = true;
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    void setUrlParams();
  }, [page, pageSize, sortColumn, sortDirection, view, isReady]);

  useEffect(() => {
    if (!resourceId || !isReady) return;

    void loadData();
  }, [resourceId, isReady, page, pageSize, sortColumn, sortDirection, loadData]);

  useEffect(() => {
    if (!isReady) return;

    if (structure === null) return;

    const nextOperators: Record<string, FilterOperatorType> = {
      ...filtersOperator,
    };
    const nextFilters: Record<string, string> = { ...filters };
    let hasChanges = false;

    headers.forEach((h) => {
      if (!nextOperators[h]) {
        nextOperators[h] = getInitialOperator(h, structure);
        hasChanges = true;
      }
      if (nextFilters[h] === undefined) {
        nextFilters[h] = "";
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFiltersOperator(nextOperators);
      setFilters(nextFilters);
      appliedFilters.current = { ...appliedFilters.current, ...nextFilters };
    }
  }, [isReady, headers, structure]);

  useEffect(() => {
    if (isReady) {
      if (nHeadersVisible < 1) {
        toastContext.showToast(
          {
            id: +new Date(),
            title: te("errors.visibleColumns.title"),
            description: te("errors.visibleColumns.description"),
            type: "warning",
            closeLabel: t("close"),
          },
          5000
        );
      }
    }
  }, [isReady, nHeadersVisible]);

  const dataValue = useMemo<DataContextType>(
    () => ({
      resourceId,
      isLoadingData,
      loadData,
      errorData,
      data,
      structure,
      total,
      totalFiltered,
    }),
    [resourceId, isLoadingData, loadData, errorData, data, structure, total, totalFiltered]
  );

  const paginationValue = useMemo<PaginationContextType>(
    () => ({
      page,
      setPage,
      pageSize,
      setPageSize,
      sortColumn,
      setSortColumn,
      sortDirection,
      setSortDirection,
    }),
    [page, pageSize, sortColumn, sortDirection]
  );

  const viewValue = useMemo<ViewContextType>(
    () => ({
      view,
      setView,
      setExtraUrlParams,
      isFullscreen,
      explorerContainerRef,
      toggleFullscreen,
    }),
    [view, setExtraUrlParams, isFullscreen, toggleFullscreen]
  );

  const filtersValue = useMemo<FiltersContextType>(
    () => ({
      headers,
      headersVisibility,
      setHeadersVisibility,
      nHeadersVisible,
      appliedHeadersVisibility: appliedHeadersVisibility.current,
      filters,
      setFilters,
      removeFilter,
      applyFilters,
      clearFilters,
      filtersOperator,
      setFiltersOperator,
      invalidFilters,
      setInvalidFilters,
      appliedFilters: appliedFilters.current,
      nFiltersApplied,
    }),
    [
      headers,
      headersVisibility,
      nHeadersVisible,
      filters,
      removeFilter,
      applyFilters,
      clearFilters,
      filtersOperator,
      invalidFilters,
      nFiltersApplied,
    ]
  );

  return (
    <DataContext.Provider value={dataValue}>
      <PaginationContext.Provider value={paginationValue}>
        <ViewContext.Provider value={viewValue}>
          <FiltersContext.Provider value={filtersValue}>{children}</FiltersContext.Provider>
        </ViewContext.Provider>
      </PaginationContext.Provider>
    </DataContext.Provider>
  );
}
