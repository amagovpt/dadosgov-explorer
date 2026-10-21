import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { data, structure } from "@/test/mock-data";
import { getData, getStructure } from "./actions";

vi.mock("@/app/i18n", () => ({
  default: async () => ({ t: (key: string) => key }),
}));

function mockFetch(status: number, body: unknown = "", statusText = "") {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  const fetchMock = vi.fn(async (_url: string) => new Response(text, { status, statusText }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getData", () => {
  it("requests the data endpoint with the query params", async () => {
    const fetchMock = mockFetch(200, data);

    await getData("pt", "res-1", 2, 50, "age", "asc", ["name"], {}, { name: "Ana" });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/resources/res-1/data/?");
    expect(url).toContain("page=2&page_size=50&age__sort=asc&name__contains=Ana");
  });

  it("returns the data on success", async () => {
    mockFetch(200, data);

    expect(await getData("pt", "res-1", 1, 10, null, null, [], {}, {})).toEqual({
      status: 200,
      data,
    });
  });

  it("returns not found on 404", async () => {
    mockFetch(404);

    expect(await getData("pt", "res-1", 1, 10, null, null, [], {}, {})).toEqual({
      status: 404,
      error: "errors.api.notFound",
      errors: [],
    });
  });

  it("returns the API error message", async () => {
    const errors = [{ code: null, title: "Bad", detail: { message: "invalid filter" } }];
    mockFetch(400, { errors });

    expect(await getData("pt", "res-1", 1, 10, null, null, [], {}, {})).toEqual({
      status: 400,
      error: "invalid filter",
      errors,
    });
  });

  it("returns a generic error when the body has no details", async () => {
    mockFetch(502, "Bad Gateway", "Bad Gateway");

    const result = await getData("pt", "res-1", 1, 10, null, null, [], {}, {});
    expect(result).toEqual({ status: 502, error: "errors.api.requestFailed", errors: [] });
  });

  it("returns a connection error when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const result = await getData("pt", "res-1", 1, 10, null, null, [], {}, {});
    expect(result).toEqual({ status: 500, error: "errors.api.connectionFailed", errors: [] });
  });
});

describe("getStructure", () => {
  it("requests the profile endpoint", async () => {
    const fetchMock = mockFetch(200, structure);

    expect(await getStructure("pt", "res-1")).toEqual({
      status: 200,
      data: structure,
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/resources/res-1/profile/");
  });

  it("returns not found on 404", async () => {
    mockFetch(404);

    expect(await getStructure("pt", "res-1")).toEqual({
      status: 404,
      error: "errors.api.notFound",
      errors: [],
    });
  });

  it("returns a connection error when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    expect(await getStructure("pt", "res-1")).toEqual({
      status: 500,
      error: "errors.api.connectionFailed",
      errors: [],
    });
  });
});
