import CardFrame from "@/components/Shared/Card/CardFrame";
import formatNumber from "@/utils/formatNumber";

export type StatCardI = {
  label: string;
  value: string;
};

export default function StatCard({ label, value }: StatCardI) {
  return (
    <div className="[&_.label-container]:text-primary-600">
      <CardFrame label={formatNumber(value)}>{label}</CardFrame>
    </div>
  );
}
