import { render, screen } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { describe, expect, it } from "vitest";
import TranslationsProvider from "./TranslationProvider";

function Title() {
  const { t } = useTranslation("common");
  return <h1>{t("title")}</h1>;
}

function renderWithLocale(locale: string) {
  render(
    <TranslationsProvider
      locale={locale}
      namespaces={["common"]}
      resources={{
        pt: { common: { title: "Explorador de dados" } },
        en: { common: { title: "Data Explorer" } },
      }}
    >
      <Title />
    </TranslationsProvider>
  );
}

describe("TranslationsProvider", () => {
  it("translates to Portuguese", async () => {
    renderWithLocale("pt");
    expect(await screen.findByText("Explorador de dados")).toBeDefined();
  });

  it("translates to English", async () => {
    renderWithLocale("en");
    expect(await screen.findByText("Data Explorer")).toBeDefined();
  });
});
