import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectFilterProps {
  value: string;
  onChange: (value: string | undefined) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}

const SelectFilter = ({ value, onChange, options, placeholder = "Select..." }: SelectFilterProps) => {
  const CLEAR_VALUE = "__clear__"; // Special value to represent "clear filter"

  return (
    <Select
      value={value || CLEAR_VALUE}
      onValueChange={val => {
        // If user selects the clear option, pass undefined to clear the filter
        onChange(val === CLEAR_VALUE ? undefined : val);
      }}
    >
      <SelectTrigger className="h-8 w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Clear filter option with a non-empty value */}
        <SelectItem value={CLEAR_VALUE}>All</SelectItem>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectFilter;
