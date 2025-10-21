import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number;
  onChange: (value: any) => void;
  debounce?: number;
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, disabled, ...props }: Props) => {
  const [value, setValue] = useState(initialValue);

  const handleClear = () => {
    setValue("");
    onChange("");
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce]);

  return (
    <div className="relative flex-1">
      <Input {...props} value={value} onChange={e => setValue(e.target.value)} />
      {/* Clear Button - Only shown when there's text */}
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
    </div>
  );
};

export default DebouncedInput;
