import { Card } from "@/src/components/ui/Card";
import { cn } from "@/src/components/ui/Button";

interface Option {
  id: string;
  label: string;
  emoji?: string;
}

interface SingleSelectOptionsProps {
  options: Option[];
  selectedId?: string;
  onSelect: (id: string) => void;
  layout?: "vertical" | "horizontal"; // Add layout prop for Gender step
}

export const SingleSelectOptions = ({
  options,
  selectedId,
  onSelect,
  layout = "vertical",
}: SingleSelectOptionsProps) => {
  // For Gender step (3 options) use horizontal layout from Figma
  const isHorizontal = layout === "horizontal" || options.length === 3;

  return (
    <div
      className={cn(
        "w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
        isHorizontal ? "flex gap-3 justify-center" : "flex flex-col gap-3",
      )}
    >
      {options.map((option) => (
        <Card
          key={option.id}
          active={selectedId === option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "flex flex-col items-center justify-center transition-all cursor-pointer",
            isHorizontal
              ? "px-5 py-6 flex-1 w-full"
              : "px-6 py-5 min-h-[60px] w-full",
          )}
        >
          {option.emoji && (
            <span
              className={cn(
                "text-4xl",
                isHorizontal ? "mb-2" : "ml-2 order-last",
              )}
            >
              {option.emoji}
            </span>
          )}
          <span
            className={cn(
              "text-text-primary text-center font-medium",
              isHorizontal ? "text-body-lg" : "text-body-xl",
            )}
          >
            {option.label}
          </span>
        </Card>
      ))}
    </div>
  );
};
