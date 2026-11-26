# Data Types and Formats

Reference of `python_type` and `format` values found in data profiles returned by the Tabular API. Used to compare against new formats that may appear and ensure that both the validator and filter components support them.

## Discovered combinations

| python_type | format                    | Applied validation                   | Placeholder           | Example                 |
| ----------- | ------------------------- | ------------------------------------ | --------------------- | ----------------------- |
| `string`    | `string`                  | Free text                            | -                     | Denominaca, Tipo        |
| `string`    | `url`                     | Free text                            | `https://...`         | Website                 |
| `string`    | `email`                   | Free text                            | `user@example.com`    | email                   |
| `string`    | `latlon_wgs`              | Free text                            | `lat,lon`             | Geographic Location     |
| `string`    | `latitude_wgs`            | Free text                            | -                     | Geographic Location     |
| `string`    | `longitude_wgs`           | Free text                            | -                     | Geographic Location     |
| `string`    | `pays`                    | Free text                            | -                     | NUTS0_desig             |
| `string`    | `iso_country_code_alpha2` | Maximum 2 characters                 | `PT`                  | NUTS0_codigo            |
| `int`       | `int`                     | Integer number (`^-?\d+$`)           | `0`                   | OBJECTID, codigo_rua    |
| `int`       | `year`                    | 4 digits, 1900-2100 range            | `YYYY`                | ano                     |
| `float`     | `float`                   | Decimal number (`^-?\d+([.,]\d+)?$`) | `0.00`                | ShapeSTLength, Peso     |
| `date`      | `date`                    | `YYYY-MM-DD` format                  | `YYYY-MM-DD`          | data_actualizacao, Data |
| `datetime`  | `datetime_naive`          | `YYYY-MM-DDTHH:MM:SS` format         | `YYYY-MM-DDTHH:MM:SS` | criacaodtt              |
| `bool`      | `bool`                    | `true` / `false` / `null`            | TriStateInput         | extensao                |

## Conditional validation by operator

Some formats alter validation depending on the selected filter operator:

| format           | Operator | Validation                                                         |
| ---------------- | -------- | ------------------------------------------------------------------ |
| `datetime_naive` | `exact`  | Required full format: `YYYY-MM-DDTHH:MM:SS`                        |
| `datetime_naive` | others   | Accepts `YYYY-MM-DD`, `YYYY-MM-DDTHH:MM`, or `YYYY-MM-DDTHH:MM:SS` |

## Formats without specific validation

These formats appear in the `format` field but are treated as free text without additional validation:

| format       | Base python_type | Reason                                             |
| ------------ | ---------------- | -------------------------------------------------- |
| `url`        | `string`         | Filter uses "contains" operator, accepts free text |
| `email`      | `string`         | Filter uses "contains" operator, accepts free text |
| `latlon_wgs` | `string`         | Filter uses "contains" operator, accepts free text |
| `pays`       | `string`         | Country name, accepts free text                    |

## Formats found only in columns_fields and columns_labels

These formats appear in `columns_fields` or `columns_labels` but not in `columns` (the field used for validation). Documented for reference:

| format            | Context        |
| ----------------- | -------------- |
| `longitude_l93`   | columns_fields |
| `latitude_wgs`    | columns_fields |
| `longitude_wgs`   | columns_fields |
| `mongo_object_id` | columns_labels |
| `code_region`     | columns_labels |
| `code_rna`        | columns_labels |
| `insee_ape700`    | columns_labels |
| `uai`             | columns_labels |

## Operators and sorting by type

Filter operators and the sort type depend on the `format` and, if that does not decide, on the `python_type`:

| Type | Operators | Sorting |
| ---- | --------- | ------- |
| Text (`string` and text formats such as `url`, `pays`, `latlon_wgs`) | `contains`, `notcontains`, `exact`, `differs`, `isnull`, `isnotnull` | Alphabetical |
| Number (`int`, `float`) | `exact`, `differs`, `isnull`, `isnotnull`, `less`, `strictly_less`, `strictly_greater`, `greater` | Numeric |
| Date (`date`, `datetime`, `year`, `datetime_naive`) | Same as numbers | By date |
| Boolean (`bool`) | `exact`, `differs`, `isnull`, `isnotnull` | Alphabetical |

An unknown `python_type` only gets the common operators (`exact`, `differs`, `isnull`, `isnotnull`).

## How to add new formats

When a new `format` or `python_type` value appears in the API:

1. Add it to the table above
2. Evaluate whether it requires specific validation in `useFilterValidation.ts` (`format` switch statement)
3. If yes, add the regex and the i18n key for the error message
4. Evaluate whether it requires a placeholder in `Filter.tsx` (`getInputType` function)
5. Evaluate whether it requires a different input type (e.g., date picker, toggle)
6. Evaluate whether it requires specific operators in `getOperatorOptions` in `data.ts`

## Documentation

- [README](README.md) - general project overview
- [Architecture](architecture.md) - data flow, providers, server actions, URL parameters, validation, and error handling
- [Data types and formats](data-formats.md) - reference for formats returned by the Tabular API and how they are validated

### Versão em Português

- [README](../../README.md) - descrição geral do projeto
- [Arquitetura](../PT/architecture.md) - fluxo de dados, providers, server actions, parâmetros do URL, validação e gestão de erros
- [Tipos e formatos de dados](../PT/data-formats.md) - referência dos formatos devolvidos pela Tabular API e como são validados
