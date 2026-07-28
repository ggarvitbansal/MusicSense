import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  gradientClass?: string;
}

export default function ProgressBar({ value, gradientClass = "from-emerald-500 to-teal-500" }: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(Math.min(100, Math.max(0, value)));
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full bg-gray-950/80 h-3 rounded-full overflow-hidden shadow-inner relative border border-gray-800/50">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
