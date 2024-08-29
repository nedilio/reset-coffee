"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "./button";
import ButtonSpinner from "./ButtonSpinner";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends ButtonProps {
  className?: string;
  children?: React.ReactNode;
  isDisabled?: boolean;
}

export default function ActionButton(props: ActionButtonProps) {
  const { pending } = useFormStatus();
  const { className, children, isDisabled, ...rest } = props;
  return (
    <Button
      {...rest}
      aria-disabled={pending || isDisabled}
      disabled={pending || props.isDisabled}
      className={cn(
        "disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity duration-200",
        props.className
      )}
    >
      <div className="flex ">{props.children}</div>
      {pending && <ButtonSpinner />}
    </Button>
  );
}
