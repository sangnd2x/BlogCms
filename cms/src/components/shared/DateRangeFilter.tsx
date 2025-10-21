// components/shared/filters/DateRangeFilter.tsx
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  value: string; // Will be in format: "2024-01-01,2024-12-31"
  onChange: (value: string | undefined) => void;
}

const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const [date, setDate] = useState<DateRange | undefined>();

  // Parse the value string into DateRange on mount
  useEffect(() => {
    if (value) {
      const [from, to] = value.split(",");
      if (from && to) {
        setDate({
          from: new Date(from),
          to: new Date(to),
        });
      }
    } else {
      setDate(undefined);
    }
  }, [value]);

  // Update parent when date changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (date?.from && date?.to) {
        const dateString = `${format(date.from, "yyyy-MM-dd")},${format(date.to, "yyyy-MM-dd")}`;
        onChange(dateString);
      } else if (!date) {
        onChange(undefined);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [date]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    onChange(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, yyyy")}
              </>
            ) : (
              format(date.from, "MMM dd, yyyy")
            )
          ) : (
            <span className="text-muted-foreground">Pick a date range</span>
          )}
          {date?.from && <X className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" onClick={handleClear} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
