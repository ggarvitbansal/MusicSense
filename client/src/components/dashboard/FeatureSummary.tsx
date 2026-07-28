import FeatureCard from "./FeatureCard";

interface FeatureSummaryProps {
  rms: number[] | null;
  centroid: number[] | null;
  bandwidth: number[] | null;
  rolloff: number[] | null;
  harmonicEnergy: number | null;
  percussiveEnergy: number | null;
  silenceRatio: number | null;
}

export default function FeatureSummary({
  rms,
  centroid,
  bandwidth,
  rolloff,
  harmonicEnergy,
  percussiveEnergy,
  silenceRatio,
}: FeatureSummaryProps) {
  const calculateMean = (arr: number[] | null): number => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const avgRms = calculateMean(rms);
  const avgCentroid = calculateMean(centroid);
  const avgBandwidth = calculateMean(bandwidth);
  const avgRolloff = calculateMean(rolloff);

  const features = [
    {
      label: "RMS Energy",
      value: avgRms.toFixed(4),
      sub: "Waveform intensity"
    },
    {
      label: "Spectral Centroid",
      value: `${Math.round(avgCentroid)} Hz`,
      sub: "Spectral center"
    },
    {
      label: "Spectral Bandwidth",
      value: `${Math.round(avgBandwidth)} Hz`,
      sub: "Frequency range width"
    },
    {
      label: "Spectral Roll-off",
      value: `${Math.round(avgRolloff)} Hz`,
      sub: "85% energy point"
    },
    {
      label: "Harmonic Share",
      value: harmonicEnergy !== null ? `${(harmonicEnergy * 100).toFixed(1)}%` : "N/A",
      sub: "Tonal melody ratio"
    },
    {
      label: "Percussive Share",
      value: percussiveEnergy !== null ? `${(percussiveEnergy * 100).toFixed(1)}%` : "N/A",
      sub: "Rhythm transient ratio"
    },
    {
      label: "Silence Portion",
      value: silenceRatio !== null ? `${(silenceRatio * 100).toFixed(1)}%` : "N/A",
      sub: "Low-energy frames"
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Audio Feature Summary</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Objective physical metrics calculated directly from the signal waveform.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {features.map((feat, i) => (
          <FeatureCard
            key={i}
            label={feat.label}
            value={feat.value}
            sub={feat.sub}
          />
        ))}
      </div>
    </div>
  );
}
