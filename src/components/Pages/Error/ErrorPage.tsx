"use client";

import StatusPage from "@/components/Pages/Shared/StatusPage";
import Button from "@/components/Shared/Button/Button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type ErrorPageI = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageI) {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      icon="agora-line-x-circle"
      error={t("errors.server.error")}
      title={t("errors.server.title")}
      subtitle={t("errors.server.subtitle")}
      description={t("errors.server.description")}
      actions={
        <>
          <Button
            appearance="solid"
            variant="neutral"
            hasIcon
            leadingIcon="agora-line-arrow-left-circle"
            leadingIconHover="agora-line-arrow-left-circle"
            onClick={() => router.back()}
            className="bg-neutral-50! text-neutral-900! hover:bg-neutral-300! [&_svg]:fill-neutral-900!"
          >
            {t("errors.server.goBack")}
          </Button>
          <Button
            appearance="solid"
            variant="neutral"
            hasIcon
            leadingIcon="agora-line-refresh-ccw"
            leadingIconHover="agora-line-refresh-ccw"
            onClick={() => reset()}
            className="bg-neutral-50! text-neutral-900! hover:bg-neutral-300! [&_svg]:fill-neutral-900!"
          >
            {t("errors.server.tryAgain")}
          </Button>
        </>
      }
    />
  );
}
