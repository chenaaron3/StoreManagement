import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

/** Export CSV button (non-functional placeholder for UI consistency). */
export function ExportCsvButton() {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0"
      onClick={() => {
        /* no-op: Export CSV is not implemented */
      }}
    >
      <Download className="size-4" />
      {t("common.exportCsv")}
    </Button>
  );
}
