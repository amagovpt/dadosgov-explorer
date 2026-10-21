import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportToCsv } from "./exportToCsv";

describe("exportToCsv", () => {
  let blobs: Blob[];
  let click: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    blobs = [];
    URL.createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob);
      return "blob:test";
    });
    URL.revokeObjectURL = vi.fn();
    click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing when there are no rows", () => {
    exportToCsv([]);
    expect(click).not.toHaveBeenCalled();
  });

  it("downloads the rows as CSV without the internal id", async () => {
    exportToCsv(
      [
        { __id: 1, name: "Ana", note: 'says "hi"' },
        { __id: 2, name: "Rui", note: null },
      ],
      "people.csv"
    );

    expect(click).toHaveBeenCalledOnce();
    expect(await blobs[0].text()).toBe('"name","note"\n"Ana","says ""hi"""\n"Rui",""');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
