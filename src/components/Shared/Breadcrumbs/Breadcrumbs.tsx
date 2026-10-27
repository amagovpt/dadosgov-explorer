"use client";

import { ReactNode } from "react";
import { Breadcrumb as BreadcrumbADS } from "@ama-pt/agora-design-system";
import { useTranslation } from "react-i18next";
import useBasePath from "@/hooks/useBasePath";

export default function Breadcrumbs({
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
  const { addBasePath } = useBasePath();

  const createBreadcrumbs = (path: string): { label: ReactNode; url: string }[] => {
    const knownLocales = ["pt", "en"];

    let pathNames = path.split("/", limit === undefined ? undefined : limit + 1).filter(Boolean);

    if (knownLocales.includes(pathNames[0])) {
      pathNames = pathNames.slice(1);
    }

    const items = pathNames.map((segment, index) => {
      const url = addBasePath("/" + pathNames.slice(0, index + 1).join("/"));

      let label: ReactNode;
      if (index === 0) {
        label = (
          <div data-elastic-include>
            <span data-elastic-name="section_name">{t(segment)}</span>
          </div>
        );
      } else if (index === pathNames.length - 1) {
        label = <span>{t(segment)}</span>;
      } else {
        label = (
          <div data-elastic-include>
            <span data-elastic-name="subarea_name" data-subarea-id={segment}>
              {t(segment)}
            </span>
          </div>
        );
      }

      return {
        label,
        url: index === pathNames.length - 1 ? "" : url,
      };
    });

    return [
      {
        label: <>{t("home")}</>,
        url: "#", //addBasePath("/"),
      },
      ...items,
    ];
  };

  return (
    <BreadcrumbADS items={createBreadcrumbs(path)} darkMode={!darkmode} className={className} />
  );
}
