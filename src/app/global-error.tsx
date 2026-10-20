"use client";

import "@/app/[locale]/globals.css";
import ErrorPage, { ErrorPageI } from "@/components/Pages/Error/ErrorPage";
import { i18nConfig } from "@/config/i18nConfig";
import enCommon from "@/locales/en/common.json";
import ptCommon from "@/locales/pt/common.json";
import TranslationsProvider from "@/providers/TranslationProvider";
import { Noto_Sans } from "next/font/google";
import { usePathname } from "next/navigation";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

// The root layout (and its TranslationsProvider) is replaced when this renders,
// so translations are loaded statically and the locale is read from the URL.
const resources = {
  pt: { common: ptCommon },
  en: { common: enCommon },
};

export default function GlobalError(props: ErrorPageI) {
  const pathname = usePathname();
  const segment = pathname?.split("/")[1] ?? "";
  const locale = i18nConfig.locales.includes(segment) ? segment : i18nConfig.defaultLocale;

  return (
    <html lang={locale}>
      <body className={`${notoSans.variable} antialiased`}>
        <TranslationsProvider locale={locale} namespaces={["common"]} resources={resources}>
          <ErrorPage {...props} />
        </TranslationsProvider>
      </body>
    </html>
  );
}
