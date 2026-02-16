import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

/** Centered message when a list/table has no data. */
export function EmptyState({ children, className, ...props }: EmptyStateProps) {
  return (
    <p
      className={cn("py-8 text-center text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}
