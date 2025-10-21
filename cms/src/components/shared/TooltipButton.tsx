import React, { JSX } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonSize, ButtonVariant } from "@/types/ui.types";

interface Props {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  icon?: JSX.Element;
  tooltip: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

const TooltipButton: React.FC<Props> = ({
  label,
  onClick,
  icon,
  tooltip,
  variant = "default",
  size = "sm",
  className,
  disabled = false,
}) => {

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={onClick}
          className={cn(className)}
          disabled={disabled}
        >
          {label}
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <label className="capitalize">{tooltip}</label>
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipButton;
