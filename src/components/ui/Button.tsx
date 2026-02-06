import { ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

// Utility for merging classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "active:scale-98 cursor-pointer",

          // Variants
          variant === "primary" && [
            "bg-primary text-text-primary shadow-lg shadow-primary/40",
            "hover:brightness-90 hover:shadow-xl hover:shadow-primary/60",
            "active:shadow-md active:shadow-primary/30",
          ],
          variant === "secondary" && [
            "bg-card text-text-primary border border-transparent",
            "hover:bg-card-hover hover:border-primary/30",
          ],
          variant === "outline" && [
            "bg-transparent border-2 border-primary text-primary",
            "hover:bg-primary/10",
          ],
          variant === "ghost" && [
            "bg-transparent text-primary hover:bg-primary/10",
            "p-0 h-auto rounded-none", // Minimal for links/back buttons
          ],

          // Sizes
          size === "sm" && "h-10 px-4 text-body-lg",
          size === "md" && "h-[56px] px-8 text-body-xl",
          size === "lg" && "h-14 px-8 text-heading-md font-bold",

          // Mods
          fullWidth && "w-full",

          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
