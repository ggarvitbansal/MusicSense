import type { ReactNode } from "react";

interface ComingSoonCardProps {
  title: string;
  icon: ReactNode;
  description: string;
}

export default function ComingSoonCard({ title, icon, description }: ComingSoonCardProps) {
  return (
    <div className="bg-gray-900/20 border border-gray-800/40 rounded-xl p-5 select-none relative overflow-hidden group">
      <div className="absolute inset-0 bg-gray-950/25 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className="p-2 rounded-lg bg-gray-850/50 text-gray-500 transition-colors duration-300">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-400 transition-colors duration-300">
            {title}
          </h4>
          <span className="text-[8px] font-bold text-gray-650 bg-gray-900/50 px-1.5 py-0.5 rounded border border-gray-800/80 mt-1 inline-block uppercase tracking-wider">
            Coming Soon
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-550 leading-relaxed relative z-10">
        {description}
      </p>
    </div>
  );
}
