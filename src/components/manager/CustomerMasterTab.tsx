import { ArrowDown, ArrowUp, Download, Filter } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { TableContainer } from '@/components/ui/table-container';
import { formatCurrency } from '@/lib/utils';

import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import type { CustomerListItem } from "@/types/analysis";

interface CustomerMasterTabProps {
  data: PrecomputedData;
}

function exportToCsv(
  rows: CustomerListItem[],
  filename: string,
  headers: string[]
) {
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.memberId,
        r.displayName,
        r.gender,
        r.age ?? "",
        r.transactionCount,
        r.totalRevenue,
        r.internalRank,
        r.lastPurchaseDate,
        r.salesAssociate,
        r.preferredBrand,
        r.preferredStore,
      ].join(",")
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

const RANKS = ["S", "A", "B", "C"] as const;
type Rank = (typeof RANKS)[number];

const GENDERS = [
  { value: "female" as const, labelKey: "genderFemale", dataValue: "女性" },
  { value: "male" as const, labelKey: "genderMale", dataValue: "男性" },
  { value: "unknown" as const, labelKey: "genderUnknown", dataValue: "" },
] as const;

export function CustomerMasterTab({ data }: CustomerMasterTabProps) {
  const { t } = useTranslation();
  const [selectedRanks, setSelectedRanks] = useState<Set<Rank>>(
    () => new Set(RANKS)
  );
  const [selectedGenders, setSelectedGenders] = useState<Set<string>>(
    () => new Set(GENDERS.map((g) => g.value))
  );
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 120]);
  const [transactionRange, setTransactionRange] = useState<[number, number]>([
    0, 99999,
  ]);
  const [purchaseAmountRange, setPurchaseAmountRange] = useState<
    [number, number]
  >([0, 999_999_999]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const rawList = (data.customerList ?? []) as CustomerListItem[];

  const sliderBounds = useMemo(() => {
    if (rawList.length === 0)
      return { maxAge: 120, maxTx: 500, maxAmt: 5_000_000 };
    const ages = rawList.map((c) => c.age).filter((a): a is number => a != null);
    const maxAge = ages.length > 0 ? Math.max(...ages) : 120;
    const maxTx = Math.max(...rawList.map((c) => c.transactionCount), 1);
    const maxAmt = Math.max(...rawList.map((c) => c.totalRevenue), 1000);
    return { maxAge, maxTx, maxAmt };
  }, [rawList]);

  const hasInitializedSliders = useRef(false);
  useEffect(() => {
    if (rawList.length === 0) return;
    if (hasInitializedSliders.current) return;
    hasInitializedSliders.current = true;
    setAgeRange([0, sliderBounds.maxAge]);
    setTransactionRange([0, sliderBounds.maxTx]);
    setPurchaseAmountRange([0, sliderBounds.maxAmt]);
  }, [rawList.length, sliderBounds.maxAge, sliderBounds.maxTx, sliderBounds.maxAmt]);

  const filtered = useMemo(() => {
    return rawList.filter((c) => {
      const rankOk =
        selectedRanks.size > 0 && selectedRanks.has(c.internalRank);
      const genderLabel = c.gender || "";
      const genderOk = GENDERS.some(
        (g) =>
          selectedGenders.has(g.value) &&
          (g.dataValue ? genderLabel === g.dataValue : !genderLabel)
      );
      const [ageLo, ageHi] = ageRange;
      const ageOk =
        (ageLo === 0 && ageHi >= sliderBounds.maxAge) ||
        (c.age != null && c.age >= ageLo && c.age <= ageHi);
      const [txLo, txHi] = transactionRange;
      const txOk =
        (txLo === 0 && txHi >= sliderBounds.maxTx) ||
        (c.transactionCount >= txLo && c.transactionCount <= txHi);
      const [amtLo, amtHi] = purchaseAmountRange;
      const amtOk =
        (amtLo === 0 && amtHi >= sliderBounds.maxAmt) ||
        (c.totalRevenue >= amtLo && c.totalRevenue <= amtHi);
      const term = searchTerm.trim().toLowerCase();
      const matchTerm =
        !term ||
        c.memberId.toLowerCase().includes(term) ||
        c.displayName.toLowerCase().includes(term);
      return rankOk && genderOk && ageOk && txOk && amtOk && matchTerm;
    });
  }, [
    rawList,
    selectedRanks,
    selectedGenders,
    ageRange,
    transactionRange,
    purchaseAmountRange,
    sliderBounds,
    searchTerm,
  ]);

  const toggleRank = (r: Rank) => {
    setSelectedRanks((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
    setPage(1);
  };

  const toggleGender = (value: string) => {
    setSelectedGenders((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    setPage(1);
  };

  type SortKey =
    | "memberId"
    | "displayName"
    | "gender"
    | "age"
    | "transactionCount"
    | "totalRevenue"
    | "internalRank"
    | "lastPurchaseDate"
    | "salesAssociate"
    | "preferredBrand"
    | "preferredStore";
  const [sortColumn, setSortColumn] = useState<SortKey>("totalRevenue");
  const [sortDesc, setSortDesc] = useState(true);

  const RANK_ORDER: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 };
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDesc ? -1 : 1;
    arr.sort((a, b) => {
      let va: string | number | null = "";
      let vb: string | number | null = "";
      switch (sortColumn) {
        case "memberId":
        case "displayName":
        case "gender":
        case "lastPurchaseDate":
        case "salesAssociate":
        case "preferredBrand":
        case "preferredStore":
          va = (a[sortColumn] ?? "").toString();
          vb = (b[sortColumn] ?? "").toString();
          return dir * (va < vb ? -1 : va > vb ? 1 : 0);
        case "age":
        case "transactionCount":
        case "totalRevenue":
          va = (a[sortColumn] as number) ?? 0;
          vb = (b[sortColumn] as number) ?? 0;
          return dir * (va < vb ? -1 : va > vb ? 1 : 0);
        case "internalRank":
          va = RANK_ORDER[(a.internalRank ?? "").toString()] ?? 0;
          vb = RANK_ORDER[(b.internalRank ?? "").toString()] ?? 0;
          return dir * (va - vb);
        default:
          return 0;
      }
    });
    return arr;
  }, [filtered, sortColumn, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort = (col: SortKey) => {
    if (sortColumn === col) setSortDesc((d) => !d);
    else {
      setSortColumn(col);
      setSortDesc(col === "totalRevenue" || col === "lastPurchaseDate" || col === "transactionCount" || col === "age" ? true : false);
    }
    setPage(1);
  };

  const SortHeader = ({
    col,
    label,
    align = "left",
  }: {
    col: SortKey;
    label: string;
    align?: "left" | "right";
  }) => (
    <th
      className={`py-3 px-4 font-medium text-muted-foreground cursor-pointer select-none hover:bg-muted/80 transition-colors whitespace-nowrap ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center gap-1 shrink-0">
        {label}
        {sortColumn === col ? (
          sortDesc ? (
            <ArrowDown className="size-3.5" />
          ) : (
            <ArrowUp className="size-3.5" />
          )
        ) : (
          <span className="size-3.5 w-[14px] inline-block" aria-hidden />
        )}
      </span>
    </th>
  );

  const handleExportCsv = () => {
    const headers = [
      t("managerPage.tabs.customerMaster.customerCode"),
      t("managerPage.tabs.customerMaster.displayName"),
      t("managerPage.tabs.customerMaster.gender"),
      t("managerPage.tabs.customerMaster.age"),
      t("managerPage.tabs.customerMaster.transactionCount"),
      t("managerPage.tabs.customerMaster.purchaseAmount"),
      t("managerPage.tabs.customerMaster.rank"),
      t("managerPage.tabs.customerMaster.lastVisitDate"),
      t("managerPage.tabs.customerMaster.salesAssociate"),
      t("managerPage.tabs.customerMaster.purchasedBrand"),
      t("managerPage.tabs.customerMaster.store"),
    ];
    exportToCsv(
      sorted,
      `customer_master_${new Date().toISOString().slice(0, 10)}.csv`,
      headers
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder={t("managerPage.tabs.customerMaster.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="max-w-xs"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="size-4" />
                  {t("managerPage.tabs.customerMaster.filters")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t("managerPage.tabs.customerMaster.customerRank")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {RANKS.map((r) => (
                        <Badge
                          key={r}
                          variant={selectedRanks.has(r) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleRank(r)}
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t("managerPage.tabs.customerMaster.filterGender")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {GENDERS.map((g) => (
                        <Badge
                          key={g.value}
                          variant={
                            selectedGenders.has(g.value) ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => toggleGender(g.value)}
                        >
                          {t(`managerPage.tabs.customerMaster.${g.labelKey}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t("managerPage.tabs.customerMaster.filterAgeRange")}{" "}
                      <span className="font-normal">
                        {ageRange[0]}–{ageRange[1]}
                      </span>
                    </p>
                    <Slider
                      value={ageRange}
                      onValueChange={(v) => {
                        setAgeRange(v as [number, number]);
                        setPage(1);
                      }}
                      min={0}
                      max={sliderBounds.maxAge}
                      step={1}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t("managerPage.tabs.customerMaster.filterTransactions")}{" "}
                      <span className="font-normal">
                        {transactionRange[0]}–{transactionRange[1]}
                      </span>
                    </p>
                    <Slider
                      value={[
                        Math.min(transactionRange[0], sliderBounds.maxTx),
                        Math.min(transactionRange[1], sliderBounds.maxTx),
                      ]}
                      onValueChange={(v) => {
                        setTransactionRange(v as [number, number]);
                        setPage(1);
                      }}
                      min={0}
                      max={sliderBounds.maxTx}
                      step={1}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {t(
                        "managerPage.tabs.customerMaster.filterPurchaseAmount"
                      )}{" "}
                      <span className="font-normal">
                        {formatCurrency(purchaseAmountRange[0])}–
                        {formatCurrency(purchaseAmountRange[1])}
                      </span>
                    </p>
                    <Slider
                      value={[
                        Math.min(purchaseAmountRange[0], sliderBounds.maxAmt),
                        Math.min(purchaseAmountRange[1], sliderBounds.maxAmt),
                      ]}
                      onValueChange={(v) => {
                        setPurchaseAmountRange(v as [number, number]);
                        setPage(1);
                      }}
                      min={0}
                      max={sliderBounds.maxAmt}
                      step={1000}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="ml-auto"
            >
              <Download className="size-4" />
              {t("common.exportCsv")}
            </Button>
          </div>
          <TableContainer>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/60">
                  <SortHeader
                    col="memberId"
                    label={t("managerPage.tabs.customerMaster.customerCode")}
                  />
                  <SortHeader
                    col="displayName"
                    label={t("managerPage.tabs.customerMaster.displayName")}
                  />
                  <SortHeader
                    col="gender"
                    label={t("managerPage.tabs.customerMaster.gender")}
                  />
                  <SortHeader
                    col="age"
                    label={t("managerPage.tabs.customerMaster.age")}
                    align="right"
                  />
                  <SortHeader
                    col="transactionCount"
                    label={t("managerPage.tabs.customerMaster.transactionCount")}
                    align="right"
                  />
                  <SortHeader
                    col="totalRevenue"
                    label={t("managerPage.tabs.customerMaster.purchaseAmount")}
                    align="right"
                  />
                  <SortHeader
                    col="internalRank"
                    label={t("managerPage.tabs.customerMaster.rank")}
                  />
                  <SortHeader
                    col="lastPurchaseDate"
                    label={t("managerPage.tabs.customerMaster.lastVisitDate")}
                  />
                  <SortHeader
                    col="salesAssociate"
                    label={t("managerPage.tabs.customerMaster.salesAssociate")}
                  />
                  <SortHeader
                    col="preferredBrand"
                    label={t("managerPage.tabs.customerMaster.purchasedBrand")}
                  />
                  <SortHeader
                    col="preferredStore"
                    label={t("managerPage.tabs.customerMaster.store")}
                  />
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, i) => (
                  <tr
                    key={c.memberId}
                    className={`border-b border-border ${i % 2 === 1 ? "bg-muted/30" : ""} hover:bg-muted/40 transition-colors`}
                  >
                    <td className="py-3 px-4 font-mono text-xs">{c.memberId}</td>
                    <td className="py-3 px-4">{c.displayName}</td>
                    <td className="py-3 px-4">{c.gender || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      {c.age != null ? c.age : "-"}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {c.transactionCount}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {formatCurrency(c.totalRevenue)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{c.internalRank}</span>
                    </td>
                    <td className="py-3 px-4">{c.lastPurchaseDate}</td>
                    <td className="py-3 px-4">{c.salesAssociate || "-"}</td>
                    <td className="py-3 px-4">{c.preferredBrand || "-"}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {c.preferredStore || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
          {sorted.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4 mt-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} / {sorted.length}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">
                    {t("managerPage.tabs.customerMaster.displayCount")}
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-md border bg-background px-2 py-1.5 text-sm"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {t("managerPage.tabs.customerMaster.prev")}
                </button>
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {t("managerPage.tabs.customerMaster.next")}
                </button>
              </div>
            </div>
          )}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              {rawList.length === 0
                ? t("managerPage.tabs.customerMaster.emptyNoData", {
                  cmd: "npm run data-pipeline",
                })
                : t("managerPage.tabs.customerMaster.emptyNoMatch")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
