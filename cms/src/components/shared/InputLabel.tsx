import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number;
  onChange: (value: any) => void;
  label: string;
  isRequired?: boolean;
}

const InputLabel = ({ value: initialValue, onChange, label, isRequired = true, disabled, ...props }: Props) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex flex-col gap-2">
      <Label className="relative camelCase tracking-wider font-semibold">
        {label}
        {isRequired ? "*" : ""}
      </Label>
      <Input
        {...props}
        value={value}
        onChange={e => setValue(e.target.value)}
        className="border"
        disabled={disabled}
        placeholder={label}
      />
    </div>
  );
};

export default InputLabel;
