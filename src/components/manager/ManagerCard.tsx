import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ManagerCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-side action in header (e.g. ExportCsvButton). */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
}

/** Manager tab card: title, optional subtitle, optional header action, content. */
export function ManagerCard({
  title,
  subtitle,
  headerAction,
  children,
  contentClassName,
}: ManagerCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle != null && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
