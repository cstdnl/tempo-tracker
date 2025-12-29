import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  progressClassName?: string;
}

export const CircularProgress = ({
  value,
  size = 14,
  strokeWidth = 1.5,
  className,
  progressClassName,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)} 
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("text-primary transition-all duration-500 ease-in-out", progressClassName)}
        />
      </svg>
    </div>
  );
};