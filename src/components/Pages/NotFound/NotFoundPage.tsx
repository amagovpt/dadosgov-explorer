"use client";

import StatusPage from "@/components/Pages/Shared/StatusPage";
import { useTranslation } from "react-i18next";

export type NotFoundI = {
  type?: "page" | "resource";
};

export default function NotFoundPage({ type = "page" }: NotFoundI) {
  const { t } = useTranslation();

  const typeKey = type === "page" ? "notFound" : "resourceNotFound";

  return (
    <StatusPage
      icon="agora-line-question-mark"
      error={t(`errors.${typeKey}.error`)}
      title={t(`errors.${typeKey}.title`)}
      subtitle={t(`errors.${typeKey}.subtitle`)}
      description={t(`errors.${typeKey}.description`)}
    />
  );
}
