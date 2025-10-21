import React from "react";
import { Search, X, FunnelX, Funnel } from "lucide-react";
import { Button } from "@/components/ui/button";
import DebouncedInput from "@/components/shared/DebounceInput";
import TooltipButton from "@/components/shared/TooltipButton";

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  debounce?: number;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

const GlobalSearch = ({
  value,
  onChange,
  placeholder = "Search",
  disabled = false,
  debounce = 500,
  showFilters = false,
  onToggleFilters,
}: GlobalSearchProps) => {
  return (
    <div className="flex items-center gap-2 w-full">
      {/* Search Input Container */}
      <div className="relative flex-1">
        {/* Search Icon */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />

        {/* Search Input Field */}
        <DebouncedInput
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          debounce={debounce}
          className="w-full pl-10 pr-10 h-12 border-2 rounded-lg"
        />
      </div>

      {/* Toggle Filter Rows Button */}
      {onToggleFilters && (
        <TooltipButton
          onClick={onToggleFilters}
          className="h-12 w-12 p-0 rounded-lg border-2"
          icon={showFilters ? <FunnelX /> : <Funnel />}
          tooltip={showFilters ? "hide filter rows" : "show filter rows"}
        />
      )}
    </div>
  );
};

export default GlobalSearch;
