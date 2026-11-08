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
      disabled={pending || isDisabled}
      className={cn(
        "relative disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity duration-200",
        className
      )}
    >
      {/* Content stays in the layout (hidden while pending) and the spinner floats on top,
          so the button never changes size and nothing around it shifts. */}
      <div className={cn("flex items-center", pending && "invisible")}>
        {children}
      </div>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <ButtonSpinner />
        </span>
      )}
    </Button>
  );
}
