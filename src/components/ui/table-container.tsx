import * as React from 'react';

import { cn } from '@/lib/utils';

interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Scrollable wrapper for tables. Use with <table className="w-full text-sm ...">. */
export function TableContainer({ children, className, ...props }: TableContainerProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)} {...props}>
      {children}
    </div>
  );
}
