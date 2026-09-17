import CardFrame from "@/components/Shared/Card/CardFrame";
import formatNumber from "@/utils/formatNumber";
import { useTranslation } from "react-i18next";

export type StatCardI = {
  label: string;
  value: string;
};

export default function StatCard({ label, value }: StatCardI) {
  const { t } = useTranslation("common");

  return (
    <div className="[&_.label-container]:text-primary-600">
      <CardFrame label={formatNumber(value, { t })}>{label}</CardFrame>
    </div>
  );
}
