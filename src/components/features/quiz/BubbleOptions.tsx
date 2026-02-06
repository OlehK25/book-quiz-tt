import { useRef, useEffect, useState } from "react";

import { cn } from "@/src/components/ui/Button";

interface Option {
  id: string;
  label: string;
  emoji?: string;
}

interface BubbleOptionsProps {
  options: Option[];
  selectedIds: string[];
  onToggle: (id: string, max?: number) => void;
  maxSelections?: number;
}

const useInView = (options: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
};

export const BubbleOptions = ({
  options,
  selectedIds,
  onToggle,
  maxSelections,
}: BubbleOptionsProps) => {
  const { ref: containerRef, isInView } = useInView({ threshold: 0.1 });
  const [isHovered, setIsHovered] = useState(false);

  const targetScroll = useRef(0);
  const isAnimating = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (containerRef.current) {
      targetScroll.current = containerRef.current.scrollLeft;
    }
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animateScroll = () => {
      if (!el) return;

      const current = el.scrollLeft;
      const target = targetScroll.current;

      const next = lerp(current, target, 0.08);

      if (Math.abs(target - next) < 0.5) {
        el.scrollLeft = target;
        isAnimating.current = false;
        return;
      }

      el.scrollLeft = next;
      rafId.current = requestAnimationFrame(animateScroll);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();

      if (!isAnimating.current) {
        targetScroll.current = el.scrollLeft;
      }

      targetScroll.current += e.deltaY;

      const maxScroll = el.scrollWidth - el.clientWidth;
      targetScroll.current = Math.max(
        0,
        Math.min(targetScroll.current, maxScroll),
      );

      if (!isAnimating.current) {
        isAnimating.current = true;
        rafId.current = requestAnimationFrame(animateScroll);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafId.current);
    };
  }, [containerRef]);

  const shouldAnimate = isInView && isHovered;

  return (
    <div
      className="w-full relative py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className={cn(
          "w-full overflow-x-auto px-8",
          "no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          "py-12",
        )}
        /**
         * GRID STRUCTURE
         * Adjusted height to 240px to give ~15px gap per row (doubled from before).
         * (240px / 2 = 120px per row. Bubble is 105px. Gap is 15px).
         */
      >
        <div className="grid grid-rows-2 grid-flow-col min-w-max justify-items-center h-[230px] pl-2 pr-16">
          {options.map((option, index) => {
            const isSelected = selectedIds.includes(option.id);
            const colIndex = Math.floor(index / 2);
            const isOddCol = colIndex % 2 !== 0;

            return (
              <div
                key={option.id}
                className="w-[105px] h-[105px] flex items-center justify-center shrink-0"
                style={{
                  // STRUCTURAL OFFSET (Column Stagger)
                  transform: isOddCol ? "translateY(45px)" : "translateY(0)",
                }}
              >
                <button
                  onClick={() => onToggle(option.id, maxSelections)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-full w-full h-full",
                    "bg-card border-[3px] transition-all duration-300",
                    "hover:scale-105 active:scale-95 cursor-pointer",
                    "shadow-lg",
                    "animate-float",

                    // Selection State
                    isSelected
                      ? "border-primary shadow-lg shadow-primary/60 z-10"
                      : "border-transparent hover:border-primary/30 z-0",
                  )}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationPlayState: shouldAnimate ? "running" : "paused",
                  }}
                >
                  <span className="text-4xl mb-2 filter drop-shadow-md">
                    {option.emoji || "✨"}
                  </span>
                  <span className="text-xs font-semibold text-text-primary text-center leading-tight px-1 wrap-break-word max-w-[90%]">
                    {option.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fade hints - Updated to bg-linear per user preference */}
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-linear-to-l from-background to-transparent pointer-events-none z-20" />
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-linear-to-r from-background to-transparent pointer-events-none z-20" />
    </div>
  );
};
