# Architecture

An overview of the project structure, how components interconnect, and how data flows from the server to the interface.

## Data flow

Loading an explorer page follows this path:

```
Browser → page.tsx (server) → getStructure (server action) → Tabular API
                                      ↓
                              structure loaded
                                      ↓
                            ExplorerProviders (client)
                            ├── TranslationProvider
                            ├── ResourceProvider
                            │   ├── reads search params from URL
                            │   ├── initializes filters, active view, and state
                            │   └── calls getData (server action) → Tabular API
                            └── ChartProvider
                                ├── axis state and chart type
                                └── syncs with URL via setExtraUrlParams
```

The structure is fetched on the server because it is required to render the page. If it fails with a 404, it renders the resource not found page. If it fails with another error, it passes the error message to the error boundary. The data is fetched on the client side because it depends on filters, pagination, and sorting controlled by the user.

## Providers

### ResourceProvider

The core provider and the sole owner of the exploration state. Instead of one large context, it exposes that state through four specialized contexts, each with its own responsibility and a hook in `src/hooks/`. This way a component only re-renders when the part it actually consumes changes: pagination, for example, does not cause renders in components that only read the structure.

The contexts are nested in the order Data, Pagination, View, Filters. Components never use the contexts directly, they always use the matching hook, which throws an error if called outside the `ResourceProvider`.

#### DataContext (`useDataContext`)

The resource data and the request state:

- `resourceId` and `structure` (received as a prop from the server)
- `data`, `isLoadingData`, and `errorData`
- `loadData`, which fetches the data again with the applied filters, sorting, and page
- `total` (records in the resource) and `totalFiltered` (records after filtering)

Requests run inside a `useTransition`, which provides `isLoadingData`. On failure, the provider stores the message in `errorData` and shows a toast.

Consumed by: almost every explorer component, including the four views, the `ChartProvider`, and the `LoadingWrapper`.

#### PaginationContext (`usePaginationContext`)

The position in the table and the chart, and the sorting:

- `page` (1-indexed) and `pageSize`, used by the table
- `chartPage`, used by the chart, which has its own pagination
- `sortColumn` and `sortDirection`

Consumed by: `TableView` and `ChartPagination`.

#### ViewContext (`useViewContext`)

How the explorer is presented:

- `view`: table, structure, metrics, or chart
- `isFullscreen`, `explorerContainerRef`, and `toggleFullscreen`, the fullscreen mode applied to the whole explorer
- `setExtraUrlParams`, the entry point for other providers to write to the URL (see below)

Consumed by: `Explorer`, `ExplorerActions`, `ChartView`, `ChartRenderer`, and `ChartProvider`.

#### FiltersContext (`useFiltersContext`)

The filters and the visible columns:

- `filters`, `filtersOperator`, and `headersVisibility`, which are the UI state and change while the user edits
- `appliedFilters` and `appliedHeadersVisibility`, the values actually sent to the API
- `invalidFilters`, which blocks applying when validation fails
- the `applyFilters`, `clearFilters`, and `removeFilter` actions

The separation between UI state and applied values is key. API requests only use the refs (`appliedFilters`, `appliedFiltersOperator`, `appliedHeadersVisibility`), which update when the user clicks "Apply filters". This avoids unnecessary requests during editing. Applying or clearing filters always returns to the first page, for both the table and the chart.

Consumed by: the components in `Explorer/Filters/`, `TableView`, and `DataNumbers`.

#### URL synchronization

The URL updates automatically when `page`, `pageSize`, `chartPage`, `sortColumn`, `sortDirection`, or `view` change, as well as when filters are applied. This write is done by the `ResourceProvider` from the state of all contexts, so it is the one part that spans them.

It receives `locale` as a prop to pass it to server actions, which require it to return translated error messages.

#### Extra URL parameters

The ResourceProvider is the sole owner of URL writes. Other providers that need to persist state in the URL do so through `setExtraUrlParams`, a stable-identity function exposed via the ViewContext. This function receives a key-value object and stores it in an internal ref. When the URL is rebuilt, these parameters are included alongside those from the ResourceProvider itself.

The mechanism uses intermediate refs (`setUrlParamsRef`, `isReadyRef`) to ensure that `setExtraUrlParams` does not depend on the lifecycle of `setUrlParams` and does not cause unnecessary re-renders.

During the initial URL read, chart parameters are recognized and stored in the ref before any writes occur, preventing them from being cleared from the URL while the ChartProvider has not yet mounted.

### ChartProvider

Manages chart-specific state, kept separate from `ResourceProvider` to avoid cluttering the global context. It reads data through `useDataContext` and writes to the URL through `useViewContext`:

- **Axes** - `xAxisKey`, `yAxisKeys` (array for multiple datasets), `rAxisKey`
- **Available columns** - `keys` (all columns) and `numericKeys` (only `int` and `float`), which define what each axis accepts
- **Type** - `chart` (Line, Bar, Radar, etc.)
- **Multi-dataset** - `multipleDatasets` (disabled for Doughnut, Pie, and Polar Area)
- **Export** - `chartRef` to capture the canvas and export it as a PNG with a white background

Fullscreen is not handled here. It belongs to the ViewContext and applies to the whole explorer area, in any view.

Initial state is read from URL search params. The chart type defaults to `Line` when absent from the URL. Axes start unselected and are validated when data loads: the X axis must exist in the dataset, and the Y and radius axes must be numeric columns. If an axis from the URL fails this check, it is cleared rather than automatically replaced. When switching to a single-dataset chart type, only the first Y axis is kept.

When the chart type, axes, or radius axis change, the ChartProvider syncs state with the URL by calling `setExtraUrlParams` from the ResourceProvider. The radius axis is only included when the chart type uses it (bubble).

### TranslationProvider

Initializes `react-i18next` on the client side with the loaded locale and translation resources.

## Layout

The layout in `src/app/[locale]/layout.tsx` wraps every page with the `TranslationProvider`, the `Header`, and the `Footer`. The header includes the language selector, which keeps the rest of the path and only swaps the locale prefix. Each page opens with a `Hero`, which holds the title and the breadcrumbs. On the explorer page the breadcrumbs are informational only (`isNonClickable`), because the application has no home page to go back to.

## Shared Components

Components inside `src/components/Shared/` are thin wrappers around the Agora Design System. Each imports the original component and re-exports it, enabling:

- Centralized customizations and overrides
- Consistent imports across the project
- Simplified replacement of the design system in the future

They contain no business logic, with one exception: `InputSelect` maintains an internal state synchronized with the `value` prop via `useEffect` to work around an Agora Design System bug that triggers `setState` during render when the value changes.

## Server Actions

Server actions in `actions.ts` are `"use server"` functions that perform fetches to the Tabular API. They receive `locale` as their first argument to return translated error messages via `initTranslations`.

The API address comes from the `TABULAR_API_URL` environment variable, read in `next.config.ts`, in `host:port` format and without a protocol. The actions prepend `http://`. Without the variable, it falls back to `127.0.0.1:8005`.

```
getData(locale, resourceId, page, pageSize, sortCol, sortOrder, headers, filtersOperator, filters, columns)
  → GET /api/resources/{id}/data/?{queryParams}
  → returns { status, data?, error?, errors? }

getStructure(locale, resourceId)
  → GET /api/resources/{id}/profile/
  → returns { status, data?, error?, errors? }
```

Both handle network errors, 404s, and API validation errors consistently, always returning an object with a `status` field instead of throwing uncaught exceptions. 404 handling is explicit and executed before generic `!response.ok` checks.

## Filter validation

Validation uses Zod and runs on the client before dispatching requests to the API. The `useFilterValidation` hook generates a dynamic schema based on the dataset structure:

1. For each column, it inspects `format` and `python_type` from `structure.profile.columns`
2. `format` takes precedence over `python_type` (e.g., `year` over `int`)
3. `isnull` and `isnotnull` operators accept any value
4. Validation errors are returned per field and rendered directly on the corresponding input
5. Empty strings or `undefined` values are allowed (optional fields)

The reference for supported formats is documented in `docs/data-formats.md`.

## Views

The `Explorer` component uses `ExplorerView` to render the active view. The selected view is managed by the ResourceProvider and persisted in the URL through the `view` parameter:

- **Table** - `TableView` with `TableHeader`, `TableBody`, `TableRowNoResults`
- **Structure** - `StructureView` with stats cards and field lists with confidence scores
- **Metrics** - `MetricsView` with data quality alerts, global summary, and per-column cards
- **Chart** - `ChartView` with `ChartSelectors`, `ChartRenderer`, `ChartPagination`

Available actions change depending on the active view:

- **Table** - CSV export (current page data)
- **Structure** - JSON export (`buildStructureExportData`)
- **Metrics** - JSON export (`buildMetricsExportData`)
- **Chart** - PNG export
- **All** - fullscreen, applied to the explorer container (`explorerContainerRef`)

Export buttons are disabled until data has loaded.

### Table sorting

Each click on a column header cycles through three states: ascending, descending, and no sorting. The active sort is stored in the URL as `{column}__sort=asc|desc`, and only one column can be sorted at a time. The sort type (`string`, `numeric`, or `date`) comes from `getSortType`, which follows the same priority of `format` over `python_type`. On numeric and date columns the Agora Design System icons are swapped, so `TableHeader` inverts the order only to display the correct icon, without changing the order sent to the API.

## URL parameters

The explorer state lives in the URL, which makes it possible to share an exact query. The reserved parameters are defined in `src/services/consts/urlParams.ts`:

| Parameter | Description |
| --------- | ----------- |
| `view` | Active view: `table`, `chart`, `structure`, or `metrics` |
| `page`, `page_size` | Table page (1-indexed) and rows per page (10, 50, or 200) |
| `columns` | Visible columns, comma-separated. Omitted when all are visible |
| `{column}__{operator}` | Applied filter, for example `year__exact=2020` or `name__contains=lisbon` |
| `{column}__sort` | Sort by that column, `asc` or `desc` |
| `chart` | Chart type |
| `chart_x`, `chart_y`, `chart_r` | X axis, Y axis (several, comma-separated), and radius axis columns |
| `chart_page` | Chart page (1-indexed) |

The `isnull` and `isnotnull` filters carry no value. Invalid values for `view`, `page_size`, or `chart` are ignored and replaced by the defaults.

## Error Handling

The error boundary hierarchy mirrors Next.js route structures:

```
global-error.tsx                         ← root layout errors (includes <html> and <body>)
not-found.tsx                            ← 404 without locale, redirects to [locale]/not-found
[locale]/error.tsx                       ← generic localized errors
[locale]/not-found.tsx                   ← localized 404
[locale]/not-found/page.tsx              ← redirect target, calls notFound()
explorer/[resource_id]/error.tsx         ← explorer errors (displays error.message)
explorer/[resource_id]/not-found.tsx     ← resource not found in API
```

Each boundary catches errors within its route segment and children. Root 404 handling redirects to `/{locale}/not-found`, picking the locale from the `locale` cookie and, failing that, from the `Accept-Language` header.

The error pages use the `StatusPage` component (`ErrorPage` and `NotFoundPage` are variants of it). `global-error.tsx` replaces the root layout, so it has no access to the regular `TranslationProvider`: it imports the `common.json` files directly and reads the locale from the URL. The explorer error also logs the `resource_id`.

## Internationalization

The project uses `react-i18next` on the client and `initTranslations` on the server. Configuration is located in `src/config/i18nConfig.ts`. The namespaces are:

- **common** - shared texts (header, buttons, error pages, API errors)
- **explorer** - explorer-specific texts (views, filters, metrics, charts, validation)
- **footer** - footer texts

Supported languages are `pt` and `en`, with `pt` as the default. Locale routing is handled in `src/proxy.ts` with `next-i18n-router`, and the prefix is always required (`prefixDefault: true`). Numbers are formatted with a space as the thousands separator.

Server actions take `locale` as an argument and create their own i18n instance because client-side `t` functions are not serializable and cannot be passed across server boundaries.

## Pagination

The API relies on 1-based pagination (`INITIAL_PAGE = 1`). The Agora Design System table component uses 0-based indexing. Conversion happens in `TableView`:

- `currentPage: page - 1` - passed to component (1-based → 0-based)
- `setPage(tablePage + 1)` - callback received (0-based → 1-based)

`ChartPagination` operates directly with 1-based indexing.

The table and the chart paginate independently. The table uses `page` and `pageSize` (10, 50, or 200). The chart uses `chartPage` and a fixed size of 1000 records (`CHART_PAGE_SIZE`). The API request uses one or the other depending on the active view.

## Tests

Tests use Vitest with Testing Library and live in `__tests__/`, in a structure that mirrors `src/`. They cover the providers, the filter validation hook, the server actions, and the data, URL, and export utilities. Shared sample data is in `__tests__/mock-data.ts`. To run them: `npm test`.

## Documentation

- [README](README.md) - general project overview
- [Architecture](architecture.md) - data flow, providers, server actions, URL parameters, validation, and error handling
- [Data types and formats](data-formats.md) - reference for formats returned by the Tabular API and how they are validated

### Versão em Português

- [README](../../README.md) - descrição geral do projeto
- [Arquitetura](../PT/architecture.md) - fluxo de dados, providers, server actions, parâmetros do URL, validação e gestão de erros
- [Tipos e formatos de dados](../PT/data-formats.md) - referência dos formatos devolvidos pela Tabular API e como são validados
