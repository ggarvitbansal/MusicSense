import { Play, Pause, Volume2, X, SkipForward, SkipBack } from "lucide-react";
import { usePlayback } from "@/context/PlaybackContext";

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    duration,
    currentTime,
    seek,
    pauseTrack,
  } = usePlayback();

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950/85 backdrop-blur-md border-t border-gray-800 z-50 px-6 py-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 transition-transform duration-300">
      {/* Left: Track Information */}
      <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
          🎵
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate" title={currentTrack.name}>
            {currentTrack.name}
          </p>
          <p className="text-xs text-gray-400 font-medium">Acoustic DNA Playing</p>
        </div>
      </div>

      {/* Center: Playback Controls and Seek Bar */}
      <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <button className="text-gray-450 hover:text-white transition cursor-pointer" disabled>
            <SkipBack className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black flex items-center justify-center transition cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-4.5 w-4.5 fill-current" />
            ) : (
              <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
            )}
          </button>
          <button className="text-gray-450 hover:text-white transition cursor-pointer" disabled>
            <SkipForward className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Seek slider */}
        <div className="flex items-center gap-3 w-full text-xs text-gray-400">
          <span className="font-mono">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full accent-emerald-500 bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Dismiss Controls */}
      <div className="flex items-center justify-end gap-4 w-full md:w-1/4">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-400" />
          <div className="w-16 bg-gray-800 h-1 rounded-full overflow-hidden">
            <div className="bg-gray-400 h-full w-2/3" />
          </div>
        </div>
        <button
          onClick={pauseTrack}
          className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
          title="Dismiss player"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
