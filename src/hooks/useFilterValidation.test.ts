import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DatasetProfileResponse, FilterOperatorType } from "@/services/types";
import { structure } from "@/test/mock-data";
import { useFilterValidation } from "./useFilterValidation";

const t = ((key: string) => key) as never;

// The mock resource only has int and string columns, so the other types are added here
const typedStructure: DatasetProfileResponse = {
  ...structure,
  profile: {
    ...structure.profile,
    header: [...structure.profile.header, "preco", "data", "ativo", "ano", "pais"],
    columns: {
      ...structure.profile.columns,
      preco: { score: 1, format: "float", python_type: "float" },
      data: { score: 1, format: "date", python_type: "date" },
      ativo: { score: 1, format: "bool", python_type: "bool" },
      ano: { score: 1, format: "year", python_type: "int" },
      pais: { score: 1, format: "iso_country_code_alpha2", python_type: "string" },
    },
  },
};

function validate(
  filters: Record<string, unknown>,
  operators: Record<string, FilterOperatorType> = {}
) {
  return renderHook(() => useFilterValidation(filters, operators, typedStructure, t)).result
    .current;
}

describe("useFilterValidation", () => {
  it("accepts valid filters", () => {
    const result = validate({
      tipo: "Vidro",
      n_contentores: "2",
      preco: "9,99",
      data: "2024-01-31",
      ativo: "true",
      ano: "2024",
      pais: "PT",
    });

    expect(result).toEqual({ errors: {}, isValid: true });
  });

  it("accepts empty filters", () => {
    expect(validate({ n_contentores: "", data: undefined }).isValid).toBe(true);
  });

  it("rejects invalid numbers", () => {
    const { errors } = validate({ n_contentores: "3.5", preco: "abc" });

    expect(errors.n_contentores).toBe("errors.validator.int");
    expect(errors.preco).toBe("errors.validator.float");
  });

  it("rejects invalid dates", () => {
    expect(validate({ data: "31/01/2024" }).errors.data).toBe("errors.validator.date");
  });

  it("rejects years out of range", () => {
    expect(validate({ ano: "24" }).errors.ano).toBe("errors.validator.year");
    expect(validate({ ano: "1800" }).errors.ano).toBe("errors.validator.yearRange");
  });

  it("rejects country codes longer than two letters", () => {
    expect(validate({ pais: "PRT" }).errors.pais).toBe("errors.validator.countryCode");
  });

  it("ignores the value for null operators", () => {
    expect(validate({ n_contentores: "abc" }, { n_contentores: "isnull" }).isValid).toBe(true);
  });
});
