import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { PulseLoader } from "react-spinners";
import { cn } from "@/lib/utils";

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, children, isLoading, disabled, loadingText, ...props }, ref) => {
    return (
      <Button
        className={cn(className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <PulseLoader color="#ffffff" size={8} margin={4} />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </div>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton"; 