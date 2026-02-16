import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Wrapper for grouped toggle/option buttons. Single place to adjust padding and background. */
export function ButtonGroup({ children, className, ...props }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex gap-1.5 rounded-lg bg-muted/70 px-1.5 py-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
