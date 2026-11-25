import { Table } from "@/components/Shared/Table";
import { useDataContext } from "@/hooks/useDataContext";
import { SortType } from "@/services/types";
import { getDataType, getSortType } from "@/services/utils/data";
import { SortOrder } from "@ama-pt/agora-design-system";

type TableHeaderI = {
  cols: string[];
  colSortOrders: SortOrder[];
  onSort: (colIdx: number, order: SortOrder) => void;
};

const NEXT_ORDER: Record<SortOrder, SortOrder> = {
  none: "ascending",
  ascending: "descending",
  descending: "none",
};

const INVERTED_ORDER: Record<SortOrder, SortOrder> = {
  none: "none",
  ascending: "descending",
  descending: "ascending",
};

// The design system's numeric/date icons are swapped: "ascending" renders the
// largest-first glyph. Only the alpha (string) icons match their order, so for
// numeric/date columns the order is inverted just for display.
const hasSwappedIcons = (sortType: SortType) => sortType !== "string";

export default function TableHeader({ cols, colSortOrders, onSort }: TableHeaderI) {
  const { structure } = useDataContext();

  return (
    <Table.Header>
      <Table.Row>
        {cols.map((col, index) => {
          const sortType = getSortType(getDataType(col, structure));
          const order = colSortOrders[index] ?? "none";

          if (!hasSwappedIcons(sortType)) {
            return (
              <Table.HeaderCell
                key={col}
                onSortChange={(next: SortOrder) => onSort(index, next)}
                sortOrder={order}
                sortType={sortType}
              >
                {col}
              </Table.HeaderCell>
            );
          }

          // The cell computes its next order from the displayed (inverted)
          // one, so it is ignored and the real next order is derived here.
          return (
            <Table.HeaderCell
              key={col}
              onSortChange={() => onSort(index, NEXT_ORDER[order])}
              sortOrder={INVERTED_ORDER[order]}
              sortType={sortType}
            >
              {col}
            </Table.HeaderCell>
          );
        })}
      </Table.Row>
    </Table.Header>
  );
}
