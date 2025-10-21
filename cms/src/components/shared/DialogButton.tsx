import React, { JSX } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonSize, ButtonVariant } from "@/types/ui.types";

interface Props {
  title: string;
  description: string;
  okText?: string;
  cancelText?: string;
  label?: string;
  icon?: JSX.Element;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const DialogButton: React.FC<Props> = ({
  title,
  description,
  label,
  icon,
  onClick,
  okText = "Continue",
  cancelText = "Cancel",
  variant = "outline",
  size = "sm",
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size}>
          {icon}
          <span className="capitalize">{label}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>{okText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DialogButton;
