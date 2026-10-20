"use client";

import Button from "@/components/Shared/Button/Button";
import { Hero } from "@/components/Shared/Hero";
import Pill from "@/components/Shared/Pill/Pill";
import { Icon } from "@ama-pt/agora-design-system";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";

export type NotFoundI = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: NotFoundI) {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full w-full flex-col gap-64">
      <Hero.Root backgroundImageUrl={null}>
        <div className="flex w-full flex-col justify-center gap-32 md:flex-row md:justify-stretch">
          <Hero.Content>
            <Suspense fallback={null}>
              <Icon
                name="agora-line-x-circle"
                aria-hidden
                focusable={false}
                className="h-[280px]! min-h-[280px]! w-[280px]! min-w-[280px]! shrink-0 fill-white!"
              />
            </Suspense>
          </Hero.Content>
          <Hero.Content>
            <div className="flex h-full flex-col gap-16">
              <Pill
                variant="primary"
                size="large"
                appearance="solid"
                className="w-fit! bg-secondary-200! text-neutral-900!"
              >
                {t("errors.generic.error")}
              </Pill>
              <Hero.Title>{t("errors.generic.title")}</Hero.Title>
              <Hero.Description
                description={
                  <div className="flex w-full flex-col gap-16">
                    <span className="text-m-bold! text-white!">{t("errors.generic.subtitle")}</span>
                    <span className="text-m-regular! text-white!">
                      {t("errors.generic.description")}
                    </span>
                  </div>
                }
              />
            </div>
            <div className="flex flex-row gap-8">
              <Button appearance="outline" onClick={() => router.back()}>
                {t("errors.generic.goBack")}
              </Button>
              <Button onClick={() => reset()}>{t("errors.generic.tryAgain")}</Button>
            </div>
          </Hero.Content>
        </div>
      </Hero.Root>
    </main>
  );
}
