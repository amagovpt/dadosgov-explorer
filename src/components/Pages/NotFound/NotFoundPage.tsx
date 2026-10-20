"use client";

import { Hero } from "@/components/Shared/Hero";
import Pill from "@/components/Shared/Pill/Pill";
import { Icon } from "@ama-pt/agora-design-system";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

export type NotFoundI = {
  type?: "page" | "resource";
};

export default function NotFoundPage({ type = "page" }: NotFoundI) {
  const { t } = useTranslation();

  const typeKey = type === "page" ? "notFound" : "resourceNotFound";

  return (
    <main className="flex h-full w-full flex-col gap-64">
      <Hero.Root backgroundImageUrl={null}>
        <div className="flex w-full flex-col justify-center gap-32 md:flex-row md:justify-stretch">
          <Hero.Content>
            <Suspense fallback={null}>
              <Icon
                name="agora-line-question-mark"
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
                {t(`errors.${typeKey}.error`)}
              </Pill>
              <Hero.Title>{t(`errors.${typeKey}.title`)}</Hero.Title>
              <Hero.Description
                description={
                  <div className="flex w-full flex-col gap-16">
                    <span className="text-m-bold! text-white!">
                      {t(`errors.${typeKey}.subtitle`)}
                    </span>
                    <span className="text-m-regular! text-white!">
                      {t(`errors.${typeKey}.description`)}
                    </span>
                  </div>
                }
              />
            </div>
          </Hero.Content>
        </div>
      </Hero.Root>
    </main>
  );
}
