import { HTMLAttributes } from "react";

import { cn } from "@/src/components/ui/Button";

interface QuestionTitleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  highlight?: string; // Word to highlight in purple/pink
}

export const QuestionTitle = ({
  title,
  subtitle,
  highlight,
  className,
  ...props
}: QuestionTitleProps) => {
  // Wraps the highlighted word in a span for styling
  const parts = highlight
    ? title.split(new RegExp(`(${highlight})`, "gi"))
    : [title];

  return (
    <div className={cn("text-center mb-8", className)} {...props}>
      <h1 className="text-heading-xl font-bold whitespace-pre-wrap leading-tight text-text-primary mb-2">
        {parts.map((part, i) =>
          highlight && part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-primary-highlight">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </h1>
      {subtitle && (
        <p className="text-body-xl text-text-secondary font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};
