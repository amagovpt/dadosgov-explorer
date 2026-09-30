"use client";

import Button from "@/components/Shared/Button/Button";
import { useDataContext } from "@/hooks/useDataContext";
import { usePaginationContext } from "@/hooks/usePaginationContext";
import { CHART_PAGE_SIZE, INITIAL_PAGE } from "@/services/consts/explorer";
import { useTranslation } from "react-i18next";

export default function ChartPagination() {
  const { t: te } = useTranslation("explorer");

  const { chartPage, setChartPage } = usePaginationContext();
  const { totalFiltered } = useDataContext();

  const totalPages = Math.max(1, Math.ceil(totalFiltered / CHART_PAGE_SIZE));
  const isFirstPage = chartPage <= INITIAL_PAGE;
  const isLastPage = chartPage >= totalPages;

  return (
    <div className="flex justify-between rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center px-16 border-r border-neutral-200">
        <span className="text-neutral-700">
          {te("pagination.itemsPerPage")}: {CHART_PAGE_SIZE}
        </span>
      </div>

      <div className="flex items-center">
        <Button
          appearance="link"
          hasIcon
          iconOnly
          trailingIcon="agora-line-chevron-left"
          trailingIconHover="agora-line-chevron-left"
          disabled={isFirstPage}
          onClick={() => setChartPage(chartPage - 1)}
          aria-label={te("pagination.prev")}
        />
        <div className="w-px h-full bg-neutral-200" />
        <Button
          appearance="link"
          hasIcon
          iconOnly
          trailingIcon="agora-line-chevron-right"
          trailingIconHover="agora-line-chevron-right"
          disabled={isLastPage}
          onClick={() => setChartPage(chartPage + 1)}
          aria-label={te("pagination.next")}
        />
      </div>
    </div>
  );
}
