import { FileAudio, Clock, Disc, Cpu, Zap, Play, Pause } from "lucide-react";
import { usePlayback } from "@/context/PlaybackContext";

interface SongOverviewProps {
  filename: string;
  duration: number;
  sampleRate: number;
  channels: number;
  tempo: number;
  url?: string;
  trackId?: string;
}

export default function SongOverview({
  filename,
  duration,
  sampleRate,
  channels,
  tempo,
  url,
  trackId,
}: SongOverviewProps) {
  const { currentTrack, isPlaying, playTrack } = usePlayback();

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const formatSampleRate = (rate: number) => {
    return `${(rate / 1000).toFixed(1)} kHz`;
  };

  const cards = [
    {
      label: "Duration",
      value: formatDuration(duration),
      icon: <Clock className="h-5 w-5 text-emerald-400" />,
      sub: "Track length"
    },
    {
      label: "Tempo",
      value: `${Math.round(tempo)} BPM`,
      icon: <Zap className="h-5 w-5 text-amber-400" />,
      sub: "BPM speed estimate"
    },
    {
      label: "Sample Rate",
      value: formatSampleRate(sampleRate),
      icon: <Disc className="h-5 w-5 text-blue-400" />,
      sub: "Digital resolution"
    },
    {
      label: "Channels",
      value: channels === 1 ? "Mono" : channels === 2 ? "Stereo" : `${channels} Ch`,
      icon: <Cpu className="h-5 w-5 text-purple-400" />,
      sub: "Channel setup"
    }
  ];

  return (
    <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-5">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <FileAudio className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">Track Analysed</span>
          <h3 className="text-lg font-bold text-white truncate mt-0.5" title={filename}>
            {filename}
          </h3>
        </div>
        {url && trackId && (
          <button
            onClick={() => playTrack({ id: trackId, name: filename, url })}
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black flex items-center justify-center transition cursor-pointer shadow-sm shrink-0"
          >
            {currentTrack?.id === trackId && isPlaying ? (
              <Pause className="h-4.5 w-4.5 fill-current" />
            ) : (
              <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
            )}
          </button>
        )}
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-gray-950/40 border border-gray-800/50 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700/50 transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">{card.label}</span>
              {card.icon}
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
