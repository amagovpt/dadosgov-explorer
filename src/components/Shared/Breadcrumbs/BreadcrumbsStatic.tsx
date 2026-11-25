"use client";

import { i18nConfig } from "@/config/i18nConfig";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BreadcrumbsStatic({
  path,
  darkmode = false,
  className,
  limit,
}: {
  path: string;
  darkmode?: boolean;
  className?: string;
  limit?: number;
}) {
  const { t } = useTranslation("common");

  let segments = path.split("/", limit === undefined ? undefined : limit + 1).filter(Boolean);
  if (i18nConfig.locales.includes(segments[0])) {
    segments = segments.slice(1);
  }

  const labels = [t("home"), ...segments.map((segment) => t(segment))];
  const isDark = !darkmode;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-y-8">
        {labels.map((label, index) => {
          const isLast = index === labels.length - 1;

          return (
            <li key={index} className="flex flex-row items-center">
              {index !== 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className={`mx-4 h-24 w-24 shrink-0 ${isDark ? "text-white" : "text-neutral-900"}`}
                />
              )}
              <span
                aria-current={isLast ? "page" : undefined}
                className={`text-s-regular ${isDark ? "text-white" : "text-neutral-900"}`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
