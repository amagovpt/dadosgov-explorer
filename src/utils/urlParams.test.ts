import { describe, expect, it } from "vitest";
import { prepareUrlSearchParams } from "./urlParams";

describe("prepareUrlSearchParams", () => {
  it("includes page and page size", () => {
    const params = prepareUrlSearchParams(2, 50, null, null, [], {}, {});
    expect(params.toString()).toBe("page=2&page_size=50");
  });

  it("adds the view and sort params", () => {
    const params = prepareUrlSearchParams(1, 10, "age", "desc", [], {}, {}, [], "chart");
    expect(params.get("view")).toBe("chart");
    expect(params.get("age__sort")).toBe("desc");
  });

  it("uses contains as the default filter operator", () => {
    const params = prepareUrlSearchParams(1, 10, null, null, ["name"], {}, { name: "Ana" });
    expect(params.get("name__contains")).toBe("Ana");
  });

  it("uses the selected filter operator", () => {
    const params = prepareUrlSearchParams(1, 10, null, null, ["age"], { age: "greater" }, { age: "30" });
    expect(params.get("age__greater")).toBe("30");
  });

  it("skips filters without a value", () => {
    const params = prepareUrlSearchParams(1, 10, null, null, ["name", "age"], {}, { name: "" });
    expect(params.has("name__contains")).toBe(false);
    expect(params.has("age__contains")).toBe(false);
  });

  it("adds null operators with an empty value", () => {
    const params = prepareUrlSearchParams(
      1,
      10,
      null,
      null,
      ["name", "age"],
      { name: "isnull", age: "isnotnull" },
      {}
    );
    expect(params.get("name__isnull")).toBe("");
    expect(params.get("age__isnotnull")).toBe("");
  });

  it("joins the visible columns", () => {
    const params = prepareUrlSearchParams(1, 10, null, null, [], {}, {}, ["name", "age"]);
    expect(params.get("columns")).toBe("name,age");
  });

  it("ignores empty extra params", () => {
    const params = prepareUrlSearchParams(1, 10, null, null, [], {}, {}, [], null, {
      chart: "bar",
      chart_x: "",
    });
    expect(params.get("chart")).toBe("bar");
    expect(params.has("chart_x")).toBe(false);
  });
});
