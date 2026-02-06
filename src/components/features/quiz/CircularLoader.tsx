"use client";

import { useEffect, useState } from "react";

interface CircularLoaderProps {
  duration?: number; // ms
  onComplete?: () => void;
  text?: string;
}

export const CircularLoader = ({
  duration = 5000,
  onComplete,
  text = "Finding collections for you...",
}: CircularLoaderProps) => {
  // We trigger animation on mount
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start animation frame next tick to ensure transition
    requestAnimationFrame(() => setActive(true));

    // JS Timer only for numeric percentage and completion callback
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pc = Math.min((elapsed / duration) * 100, 100);
      setProgress(pc);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  // SVG Geometry
  const size = 240;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // We use CSS transition for the stroke-dashoffset for GPU smoothness
  // calculated dynamically based on duration prop
  const offset = active ? 0 : circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Track background */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="var(--color-text-primary)"
            strokeWidth={strokeWidth}
            fill="transparent"
            style={{ opacity: 0.1 }}
          />

          {/* Progress stroke */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="var(--color-primary)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: `stroke-dashoffset ${duration}ms linear`,
            }}
          />
        </svg>

        {/* Percentage Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-display-xl font-bold text-text-primary font-heading">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Loading Text */}
      <p className="mt-8 text-text-primary text-body-lg font-medium text-center animate-pulse">
        {text}
      </p>
    </div>
  );
};
