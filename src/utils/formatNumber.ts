import { TFunction } from "i18next";

interface FormatNumberOptions {
  decimalPlaces?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  t?: TFunction<"common", undefined>;
}

function formatNumber(value: number | string, options: FormatNumberOptions = {}): string {
  const { decimalPlaces, thousandsSeparator = " ", decimalSeparator = ",", t } = options;

  const normalizedThousandsSeparator = /\s/.test(thousandsSeparator) ? /\s/ : thousandsSeparator;

  const numericValue =
    typeof value === "number"
      ? value
      : Number(
          value
            .split(normalizedThousandsSeparator)
            .join("")
            .split(decimalSeparator)
            .join("."),
        );

  if (Number.isNaN(numericValue)) {
    throw new Error(
      t
        ? t("errors.api.invalidNumber", { value })
        : `formatNumber: valor inválido recebido: "${value}"`,
    );
  }

  const isNegative = numericValue < 0;
  const absoluteValue = Math.abs(numericValue);

  // if decimalPlaces is defined, it forces that number of decimal places
  // otherwise,
  // it uses the natural representation of the number, without extra zeros
  const fixed =
    decimalPlaces !== undefined ? absoluteValue.toFixed(decimalPlaces) : absoluteValue.toString();

  const [integerPart, fractionalPart] = fixed.split(".");

  const integerWithSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  const result = fractionalPart
    ? `${integerWithSeparator}${decimalSeparator}${fractionalPart}`
    : integerWithSeparator;

  return isNegative ? `-${result}` : result;
}

export default formatNumber;
