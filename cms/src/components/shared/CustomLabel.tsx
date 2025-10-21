import React from "react";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  isRequired?: boolean;
}

const CustomLabel: React.FC<Props> = ({ label, isRequired = true }) => {
  return (
    <Label className="relative capitalize tracking-wider font-semibold">
      {label}
      {isRequired ? "*" : ""}
    </Label>
  );
};

export default CustomLabel;
