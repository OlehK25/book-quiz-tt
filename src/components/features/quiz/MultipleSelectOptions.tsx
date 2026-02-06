import { Card } from "@/src/components/ui/Card";
import { cn } from "@/src/components/ui/Button";

interface Option {
  id: string;
  label: string;
}

interface MultipleSelectOptionsProps {
  options: Option[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const MultipleSelectOptions = ({
  options,
  selectedIds,
  onToggle,
}: MultipleSelectOptionsProps) => {
  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);

        return (
          <Card
            key={option.id}
            active={isSelected}
            onClick={() => onToggle(option.id)}
            className="relative flex items-center justify-center px-6 py-5 min-h-[72px]"
          >
            <span className="text-body-md text-text-primary text-center flex-1">
              {option.label}
            </span>

            {/* Custom Checkbox - Absolute positioned to keep text perfectly centered */}
            <div
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2",
                "w-6 h-6 rounded-[8px] border-2 flex items-center justify-center transition-colors border-primary",
                isSelected ? "bg-primary " : "bg-purple-muted",
              )}
            >
              {isSelected && (
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-text-primary"
                >
                  <path
                    d="M1 5L4.5 9L13 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
