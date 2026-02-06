import { useEffect, useState } from "react";

interface LoaderProps {
  percentage?: number;
}

export const Loader = ({ percentage }: LoaderProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        return Math.min(prev + Math.floor(Math.random() * 10) + 5, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700">
      {/* Circle Loader */}
      <div className="relative w-[150px] h-[150px] mb-8">
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full border-[6px] border-card" />

        {/* Spinning indicator */}
        <div
          className="absolute inset-0 rounded-full border-[6px] border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"
          style={{ borderTopColor: "var(--color-primary)" }}
        />

        {/* Percentage text inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-text-primary">
            {percentage ?? progress}%
          </span>
        </div>
      </div>

      <h2 className="text-body-xl font-semibold text-text-primary text-center max-w-[280px]">
        Finding collections for you...
      </h2>
    </div>
  );
};
