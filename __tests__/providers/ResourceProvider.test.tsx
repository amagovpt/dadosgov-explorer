import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDataContext } from "@/hooks/useDataContext";
import { useFiltersContext } from "@/hooks/useFiltersContext";
import { usePaginationContext } from "@/hooks/usePaginationContext";
import { useViewContext } from "@/hooks/useViewContext";
import { data, structure } from "../mock-data";
import { ResourceProvider } from "@/providers/ResourceProvider";

const mocks = vi.hoisted(() => ({
  getData: vi.fn(),
  showToast: vi.fn(),
  searchParams: new URLSearchParams(),
  t: (key: string) => key,
}));

vi.mock("@/app/[locale]/explorer/[resource_id]/actions", () => ({ getData: mocks.getData }));
vi.mock("next/navigation", () => ({ useSearchParams: () => mocks.searchParams }));
vi.mock("@ama-pt/agora-design-system", () => ({
  useToastContext: () => ({ showToast: mocks.showToast }),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: mocks.t }) }));

const okResponse = { status: 200, data };

function useContexts() {
  return {
    data: useDataContext(),
    pagination: usePaginationContext(),
    view: useViewContext(),
    filters: useFiltersContext(),
  };
}

function renderProvider(query = "") {
  mocks.searchParams = new URLSearchParams(query);
  return renderHook(useContexts, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ResourceProvider locale="pt" resourceId="res-1" structure={structure}>
        {children}
      </ResourceProvider>
    ),
  });
}

function lastGetDataCall() {
  return mocks.getData.mock.calls.at(-1)!;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getData.mockResolvedValue(okResponse);
  window.history.replaceState(null, "", "/pt/explorer/res-1");
});

describe("ResourceProvider", () => {
  it("reads the initial state from the URL", async () => {
    const { result } = renderProvider(
      "page=2&page_size=50&view=metrics&n_contentores__sort=desc&tipo__contains=Vidro&n_contentores__greater=2&columns=tipo,n_contentores"
    );

    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());
    const { pagination, view, filters } = result.current;

    expect(pagination).toMatchObject({
      page: 2,
      pageSize: 50,
      sortColumn: "n_contentores",
      sortDirection: "desc",
    });
    expect(view.view).toBe("metrics");
    expect(filters.filters).toMatchObject({ tipo: "Vidro", n_contentores: "2" });
    expect(filters.filtersOperator).toMatchObject({ tipo: "contains", n_contentores: "greater" });
    expect(filters.headersVisibility).toMatchObject({
      tipo: true,
      n_contentores: true,
      rua: false,
    });
    expect(filters.nFiltersApplied).toBe(2);
  });

  it("falls back to defaults for invalid URL values", async () => {
    const { result } = renderProvider("page_size=999&view=invalid&page=abc");

    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());

    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.pageSize).toBe(10);
    expect(result.current.view.view).toBe("table");
  });

  it("loads the data with the URL state", async () => {
    renderProvider("page=2&n_contentores__sort=asc&tipo__contains=Vidro&columns=tipo");

    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());
    const [locale, resourceId, page, pageSize, sortCol, sortOrder, , , filters, columns] =
      lastGetDataCall();

    expect([locale, resourceId, page, pageSize, sortCol, sortOrder]).toEqual([
      "pt",
      "res-1",
      2,
      10,
      "n_contentores",
      "asc",
    ]);
    expect(filters).toMatchObject({ tipo: "Vidro" });
    expect(columns).toEqual(["tipo"]);
  });

  it("exposes the loaded data and totals", async () => {
    const { result } = renderProvider();

    await waitFor(() => expect(result.current.data.data).toEqual(okResponse.data));

    expect(result.current.data.total).toBe(1219);
    expect(result.current.data.totalFiltered).toBe(1219);
    expect(result.current.data.errorData).toBeNull();
  });

  it("shows the API error when the request fails", async () => {
    mocks.getData.mockResolvedValue({
      status: 400,
      error: "Bad request",
      errors: [{ detail: { hint: "invalid filter" } }],
    });
    const { result } = renderProvider();

    await waitFor(() => expect(result.current.data.errorData).toBe("invalid filter"));

    expect(result.current.data.data).toBeNull();
    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "failure", description: "invalid filter" }),
      5000
    );
  });

  it("shows a generic error when getData throws", async () => {
    mocks.getData.mockRejectedValue(new Error("boom"));
    const { result } = renderProvider();

    await waitFor(() => expect(result.current.data.errorData).toBe("errors.data.failed"));
    expect(mocks.showToast).toHaveBeenCalled();
  });

  it("uses the chart page and size in the chart view", async () => {
    renderProvider("view=chart&chart_page=3");

    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());
    const [, , page, pageSize] = lastGetDataCall();

    expect(page).toBe(3);
    expect(pageSize).toBe(1000);
  });

  it("keeps the URL in sync with the pagination", async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());

    act(() => result.current.pagination.setPage(4));

    await waitFor(() => expect(window.location.search).toContain("page=4"));
    expect(window.location.pathname).toBe("/pt/explorer/res-1");
  });

  it("applies trimmed filters and goes back to the first page", async () => {
    const { result } = renderProvider("page=3");
    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());

    act(() => result.current.filters.setFilters({ tipo: "  Papel  " }));
    act(() => result.current.filters.applyFilters());

    await waitFor(() => expect(lastGetDataCall()[2]).toBe(1));
    expect(lastGetDataCall()[8]).toEqual({ tipo: "Papel" });
    expect(result.current.filters.filters).toEqual({ tipo: "Papel" });
    expect(result.current.filters.nFiltersApplied).toBe(1);
    expect(window.location.search).toContain("tipo__contains=Papel");
  });

  it("removes a single filter", async () => {
    const { result } = renderProvider("tipo__contains=Vidro&n_contentores__greater=2");
    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());

    act(() => result.current.filters.removeFilter("tipo"));

    await waitFor(() => expect(lastGetDataCall()[8]).not.toHaveProperty("tipo"));
    expect(lastGetDataCall()[8]).toMatchObject({ n_contentores: "2" });
    expect(result.current.filters.filters).not.toHaveProperty("tipo");
  });

  it("clears filters, operators and hidden columns", async () => {
    const { result } = renderProvider(
      "page=3&tipo__contains=Vidro&n_contentores__greater=2&columns=tipo"
    );
    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());

    act(() => result.current.filters.clearFilters());

    await waitFor(() => expect(result.current.pagination.page).toBe(1));
    expect(result.current.filters.filters).toEqual({});
    expect(result.current.filters.filtersOperator).toMatchObject({
      tipo: "contains",
      n_contentores: "exact",
    });
    expect(result.current.filters.nHeadersVisible).toBe(structure.profile.header.length);
    expect(result.current.filters.nFiltersApplied).toBe(0);
  });

  it("adds extra params to the URL", async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());

    act(() => result.current.view.setExtraUrlParams({ chart: "Bar" }));

    expect(window.location.search).toContain("chart=Bar");
  });

  it("warns when no column is visible", async () => {
    const { result } = renderProvider();
    await waitFor(() => expect(mocks.getData).toHaveBeenCalled());
    expect(mocks.showToast).not.toHaveBeenCalled();

    act(() => result.current.filters.setHeadersVisibility({}));

    expect(mocks.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "warning" }),
      5000
    );
  });
});
