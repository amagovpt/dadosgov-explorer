"use client";

import { useTranslation } from "react-i18next";
import Explorer from "./Explorer";
import { Hero } from "../Shared/Hero";
import { usePathname } from "next/navigation";

export default function ExplorerPageContent() {
  const path = usePathname();
  const { t: te } = useTranslation("explorer");

  return (
    <main className="flex w-full flex-col items-center gap-64 pb-96">
      <Hero.Root>
        <Hero.Breadcrumb path={path} limit={2} />
        <Hero.Content>
          <Hero.Title>{te("title")}</Hero.Title>
          <Hero.Description description={te("description")} />
        </Hero.Content>
      </Hero.Root>

      <section className="container flex w-full flex-col gap-32">
        <Explorer />
      </section>
    </main>
  );
}
