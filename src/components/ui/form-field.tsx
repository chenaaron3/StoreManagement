import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: React.ReactNode;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

/** Label + input (or other control) with consistent spacing. */
export function FormField({ label, htmlFor, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
