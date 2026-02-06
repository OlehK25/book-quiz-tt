import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "./Button"; // Reusing cn utility

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-body-sm font-medium text-text-pink-light">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            // Base styles
            "w-full rounded-[16px] bg-card px-6 py-6 text-body-md text-text-primary transition-all duration-200",
            "placeholder:text-text-pink-light/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",

            // Error state
            error && "border-2 border-red-500 bg-red-900/10",

            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50",

            className,
          )}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
