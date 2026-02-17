import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start gap-2 text-left font-normal ${className ?? ""}`}
        >
          <CalendarIcon className="size-4 shrink-0" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "yyyy-MM-dd")} ~ {format(value.to, "yyyy-MM-dd")}
              </>
            ) : (
              format(value.from, "yyyy-MM-dd")
            )
          ) : (
            <span className="text-muted-foreground">{t("dateRange.select")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" side="bottom" sideOffset={4}>
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange(range);
            if (range?.from && range?.to) setOpen(false);
          }}
          defaultMonth={value?.from ?? new Date()}
          captionLayout="dropdown"
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
