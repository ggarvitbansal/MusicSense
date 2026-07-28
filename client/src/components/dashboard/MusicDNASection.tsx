import MusicDNACard from "./MusicDNACard";
import { Zap, Sun, Activity, Music, Flame, Sparkles, Sliders, VolumeX } from "lucide-react";

interface MusicDNAData {
  energy: number;
  brightness: number;
  rhythm: number;
  harmonicRichness: number;
  danceability: number;
  acousticness: number;
  complexity: number;
  silence: number;
}

interface MusicDNASectionProps {
  dna: MusicDNAData;
}

export default function MusicDNASection({ dna }: MusicDNASectionProps) {
  const dnaTraits = [
    {
      label: "Energy",
      score: dna.energy,
      icon: <Zap className="h-4 w-4" />,
      description: "Overall intensity, volume level, and percussive transients.",
      gradientClass: "from-red-500 to-orange-500"
    },
    {
      label: "Brightness",
      score: dna.brightness,
      icon: <Sun className="h-4 w-4" />,
      description: "Treble frequency presence, yielding a sparkling vs dark tone.",
      gradientClass: "from-yellow-400 to-amber-500"
    },
    {
      label: "Rhythm",
      score: dna.rhythm,
      icon: <Activity className="h-4 w-4" />,
      description: "Rhythmic speed (Tempo BPM) combined with transient rates.",
      gradientClass: "from-blue-500 to-cyan-500"
    },
    {
      label: "Harmonic Richness",
      score: dna.harmonicRichness,
      icon: <Music className="h-4 w-4" />,
      description: "Melodic clarity and distinct harmonic instrumental contrast.",
      gradientClass: "from-purple-500 to-indigo-500"
    },
    {
      label: "Danceability",
      score: dna.danceability,
      icon: <Flame className="h-4 w-4" />,
      description: "Pulse strength and rhythmic stability around house BPM.",
      gradientClass: "from-pink-500 to-rose-500"
    },
    {
      label: "Acousticness",
      score: dna.acousticness,
      icon: <Sparkles className="h-4 w-4" />,
      description: "Likelihood of acoustic organic instruments vs synthetic audio.",
      gradientClass: "from-emerald-500 to-teal-500"
    },
    {
      label: "Complexity",
      score: dna.complexity,
      icon: <Sliders className="h-4 w-4" />,
      description: "Bandwidth spread, separating solo instruments from symphonies.",
      gradientClass: "from-violet-500 to-fuchsia-500"
    },
    {
      label: "Silence",
      score: dna.silence,
      icon: <VolumeX className="h-4 w-4" />,
      description: "Percentage of quiet / silent frames or ambient decay pauses.",
      gradientClass: "from-slate-500 to-gray-500"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white tracking-tight">Music DNA Profile</h3>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
          Semantic Interpretation
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dnaTraits.map((trait, i) => (
          <MusicDNACard
            key={i}
            label={trait.label}
            score={trait.score}
            icon={trait.icon}
            description={trait.description}
            gradientClass={trait.gradientClass}
          />
        ))}
      </div>
    </div>
  );
}
