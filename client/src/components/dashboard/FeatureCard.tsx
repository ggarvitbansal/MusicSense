interface FeatureCardProps {
  label: string;
  value: string | number;
  sub: string;
}

export default function FeatureCard({ label, value, sub }: FeatureCardProps) {
  return (
    <div className="bg-gray-900/25 border border-gray-800/60 rounded-xl p-4 flex flex-col justify-between hover:border-gray-850 transition-colors duration-300">
      <div>
        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">
          {label}
        </span>
        <p className="text-lg font-bold text-white tracking-tight mt-1 truncate" title={String(value)}>
          {value}
        </p>
      </div>
      <span className="text-[10px] text-gray-400 mt-2 block truncate" title={sub}>
        {sub}
      </span>
    </div>
  );
}
