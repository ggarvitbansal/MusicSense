import type { ReactNode } from "react";
import ProgressBar from "./ProgressBar";

interface MusicDNACardProps {
  label: string;
  score: number;
  icon: ReactNode;
  description: string;
  gradientClass: string;
}

export default function MusicDNACard({
  label,
  score,
  icon,
  description,
  gradientClass,
}: MusicDNACardProps) {
  return (
    <div className="bg-gray-900/30 border border-gray-800/60 rounded-xl p-5 hover:border-gray-700/50 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-950/50 text-gray-400">
              {icon}
            </div>
            <span className="text-sm font-bold text-white tracking-wide">{label}</span>
          </div>
          <span className="text-base font-extrabold text-emerald-400 tabular-nums">
            {Math.round(score)}
          </span>
        </div>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed min-h-[36px]">
          {description}
        </p>
      </div>

      <div className="mt-4">
        <ProgressBar value={score} gradientClass={gradientClass} />
      </div>
    </div>
  );
}
