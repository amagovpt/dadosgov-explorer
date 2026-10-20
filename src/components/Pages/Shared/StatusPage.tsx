"use client";

import { Hero } from "@/components/Shared/Hero";
import Pill from "@/components/Shared/Pill/Pill";
import { Icon } from "@ama-pt/agora-design-system";
import { ReactNode, Suspense } from "react";

export type StatusPageI = {
  icon: string;
  error: string;
  title: string;
  subtitle: string;
  description: string;
  actions?: ReactNode;
};

export default function StatusPage({
  icon,
  error,
  title,
  subtitle,
  description,
  actions,
}: StatusPageI) {
  return (
    <main className="flex h-full w-full flex-col gap-64">
      <Hero.Root backgroundImageUrl={null}>
        <div className="flex w-full flex-col justify-center gap-32 md:flex-row md:justify-stretch">
          <Hero.Content>
            <Suspense fallback={null}>
              <Icon
                name={icon}
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
                {error}
              </Pill>
              <Hero.Title>{title}</Hero.Title>
              <Hero.Description
                description={
                  <div className="flex w-full flex-col gap-16">
                    <span className="text-m-bold! text-white!">{subtitle}</span>
                    <span className="text-m-regular! text-white!">{description}</span>
                  </div>
                }
              />
            </div>
            {actions && <div className="flex flex-row gap-8">{actions}</div>}
          </Hero.Content>
        </div>
      </Hero.Root>
    </main>
  );
}
