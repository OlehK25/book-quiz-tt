import { HTMLAttributes, forwardRef } from "react";

import { cn } from "./Button"; // Reusing cn utility

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, active, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base
          "rounded-[16px] bg-card p-4 transition-all duration-200 border-2 border-transparent",
          // Hover with cursor
          "hover:bg-card-hover cursor-pointer active:scale-[0.98]",
          // Active state (selected)
          active &&
            "border-primary bg-card-hover shadow-[0_0_15px_rgba(228,34,156,0.3)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
