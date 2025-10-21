import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectFilterProps {
  value: string[]; // Array of selected IDs
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  isLoading?: boolean;
}

const MultiSelectFilter = ({
  value = [],
  onChange,
  options,
  placeholder = "Select items...",
  isLoading = false,
}: MultiSelectFilterProps) => {
  const [open, setOpen] = React.useState(false);

  // Ensure value is always an array
  const valueArray = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [];
  }, [value]);

  // Get labels for selected values
  const selectedOptions = React.useMemo(() => {
    return options.filter(option => valueArray.includes(option.value));
  }, [options, valueArray]);

  // Handle selecting/deselecting an option
  const handleSelect = (selectedValue: string) => {
    const newValue = valueArray.includes(selectedValue)
      ? valueArray.filter(v => v !== selectedValue) // Remove if already selected
      : [...valueArray, selectedValue]; // Add if not selected

    onChange(newValue.length > 0 ? newValue : []);
  };

  // Clear all selections
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange([]);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-8 font-normal pr-16"
          >
            <div className="flex-1 text-left overflow-hidden w-full">
              {selectedOptions.length === 0 ? (
                <div className="text-muted-foreground">{placeholder}</div>
              ) : (
                <div className="flex gap-1 flex-wrap">
                  {selectedOptions.length <= 2 ? (
                    selectedOptions.map(option => (
                      <Badge key={option.value} variant="secondary" className="text-xs">
                        {option.label}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {selectedOptions.length} selected
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandEmpty>{isLoading ? "Loading..." : "No results found."}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map(option => {
                const isSelected = valueArray.includes(option.value);
                return (
                  <CommandItem key={option.value} value={option.label} onSelect={() => handleSelect(option.value)}>
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Clear button positioned absolutely outside the Button */}
      {selectedOptions.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-8 top-1/2 -translate-y-1/2 hover:bg-accent rounded p-0.5 z-10"
        >
          <X className="h-4 w-4 opacity-50 hover:opacity-100" />
        </button>
      )}
    </div>
  );
};

export default MultiSelectFilter;
