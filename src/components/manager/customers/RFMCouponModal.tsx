import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import type { RFMMatrixCell } from "@/types/analysis";
import { formatNumber } from "@/lib/utils";

const RECENCY_KEYS = ["mostRecent", "recent", "lessRecent", "leastRecent"] as const;
const FREQUENCY_KEYS = ["high", "mediumHigh", "mediumLow", "low"] as const;

function getSegmentLabel(
  cell: RFMMatrixCell,
  t: (key: string) => string
): string {
  const rKey = RECENCY_KEYS[4 - cell.rScore] ?? "leastRecent";
  const fKey = FREQUENCY_KEYS[4 - cell.fScore] ?? "low";
  return `${t("rfmLabels." + rKey)} / ${t("rfmLabels." + fKey)}`;
}

interface RFMCouponModalProps {
  selectedCell: RFMMatrixCell | null;
  onClose: () => void;
}

export function RFMCouponModal({ selectedCell, onClose }: RFMCouponModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!selectedCell} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{t("rfm.targetedCoupon")}</DialogTitle>
          <DialogDescription>
            {selectedCell && (
              <>
                {t("rfm.targetedCouponDesc")}
                <br />
                {getSegmentLabel(selectedCell, t)} ({formatNumber(selectedCell.count)} {t("rfm.customersLabel")}, ¥
                {(selectedCell.totalRevenue / 1000000).toFixed(1)}M)
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {selectedCell && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="flex flex-col gap-4"
          >
            <FormField label={t("rfm.couponName")} htmlFor="coupon-name">
              <Input
                id="coupon-name"
                placeholder={t("rfm.couponNamePlaceholder")}
              />
            </FormField>
            <FormField label={t("rfm.discount")} htmlFor="coupon-discount">
              <Input
                id="coupon-discount"
                placeholder={t("rfm.discountPlaceholder")}
              />
            </FormField>
            <FormField label={t("rfm.expiry")} htmlFor="coupon-expiry">
              <Input id="coupon-expiry" type="date" />
            </FormField>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("rfm.createCoupon")}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
