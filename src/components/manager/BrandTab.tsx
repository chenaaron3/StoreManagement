import { useTranslation } from "react-i18next";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { ManagerCard } from "./ManagerCard";
import { TableContainer } from "@/components/ui/table-container";
import type { PrecomputedData } from "@/utils/precomputedDataLoader";
import { formatCurrency } from "@/lib/utils";

interface BrandTabProps {
  data: PrecomputedData;
}

export function BrandTab({ data }: BrandTabProps) {
  const { t } = useTranslation();
  return (
    <ManagerCard
      title={t("brandTab.title")}
      subtitle={t("brandTab.subtitle")}
      headerAction={<ExportCsvButton />}
    >
      <TableContainer>
        <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">{t("brandTab.brand")}</th>
                <th className="text-right py-2 font-medium">{t("common.revenue")}</th>
                <th className="text-right py-2 font-medium">{t("brandTab.transactions")}</th>
                <th className="text-right py-2 font-medium">{t("brandTab.customers")}</th>
                <th className="text-right py-2 font-medium">{t("brandTab.aov")}</th>
                <th className="text-right py-2 font-medium">{t("brandTab.stores")}</th>
              </tr>
            </thead>
            <tbody>
              {data.brandPerformance.slice(0, 14).map((b) => (
                <tr key={b.brandCode} className="border-b">
                  <td className="py-2">{b.brandName || b.brandCode}</td>
                  <td className="text-right py-2">{formatCurrency(b.totalRevenue)}</td>
                  <td className="text-right py-2">{b.transactions.toLocaleString()}</td>
                  <td className="text-right py-2">{b.customers.toLocaleString()}</td>
                  <td className="text-right py-2">{formatCurrency(b.averageOrderValue)}</td>
                  <td className="text-right py-2">{b.storeCount}</td>
                </tr>
              ))}
            </tbody>
        </table>
      </TableContainer>
    </ManagerCard>
  );
}
