import { useState, useEffect } from "react";
import { Loader2, Music, Zap, Layers, Play, Pause, Activity, ShieldAlert } from "lucide-react";
import { usePlayback } from "@/context/PlaybackContext";
import API from "@/services/api";

interface StatsData {
  totalCount: number;
  averageDNA: {
    energy: number;
    brightness: number;
    rhythm: number;
    harmonicRichness: number;
    danceability: number;
    acousticness: number;
    complexity: number;
    silence: number;
  };
  tempoDistribution: {
    chill: number;
    groove: number;
    energized: number;
  };
  latestTracks: Array<{
    id: string;
    audioFileId: string;
    filename: string;
    tempo: number;
    energy: number;
    danceability: number;
    url?: string;
  }>;
}

export default function Dashboard() {
  const { currentTrack, isPlaying, playTrack } = usePlayback();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = await API.get("/analysis/stats");
      if (res.data?.success && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-bold text-white">Dashboard Error</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{error || "Failed to retrieve library analysis metrics."}</p>
        <button
          onClick={fetchStats}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- TRIGONOMETRIC CALCULATIONS FOR THE RADAR CHART ---
  const dnaKeys = [
    { key: "energy", label: "Energy" },
    { key: "brightness", label: "Brightness" },
    { key: "rhythm", label: "Rhythm" },
    { key: "harmonicRichness", label: "Harmony" },
    { key: "danceability", label: "Dance" },
    { key: "acousticness", label: "Acoustic" },
    { key: "complexity", label: "Complexity" },
    { key: "silence", label: "Silence" },
  ];

  const cx = 150;
  const cy = 150;
  const maxRadius = 90;

  // Grid octagons (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridOctagons = gridLevels.map((level) => {
    const points = dnaKeys.map((_, i) => {
      const angle = i * (Math.PI / 4) - Math.PI / 2;
      const x = cx + Math.cos(angle) * maxRadius * level;
      const y = cy + Math.sin(angle) * maxRadius * level;
      return `${x},${y}`;
    }).join(" ");
    return points;
  });

  // Calculate polygon coordinates from average DNA stats
  const dataPoints = dnaKeys.map((item, i) => {
    const val = stats.averageDNA[item.key as keyof typeof stats.averageDNA] || 0;
    const level = val / 100;
    const angle = i * (Math.PI / 4) - Math.PI / 2;
    const x = cx + Math.cos(angle) * maxRadius * level;
    const y = cy + Math.sin(angle) * maxRadius * level;
    return `${x},${y}`;
  }).join(" ");

  // Axis lines
  const axisLines = dnaKeys.map((item, i) => {
    const angle = i * (Math.PI / 4) - Math.PI / 2;
    const x = cx + Math.cos(angle) * maxRadius;
    const y = cy + Math.sin(angle) * maxRadius;
    const labelX = cx + Math.cos(angle) * (maxRadius + 18);
    const labelY = cy + Math.sin(angle) * (maxRadius + 10) + 4; // slight vertical adjustment
    return { x, y, labelX, labelY, label: item.label };
  });

  // --- TEMPO BAR CALCULATIONS ---
  const chillVal = stats.tempoDistribution.chill;
  const grooveVal = stats.tempoDistribution.groove;
  const energizedVal = stats.tempoDistribution.energized;
  const maxTempoVal = Math.max(chillVal, grooveVal, energizedVal, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Your Dashboard</h2>
        <p className="text-gray-400 mt-1">Personalized acoustic analytics computed from your audio library.</p>
      </div>

      {/* Numerical Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:border-emerald-500/30 transition duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Acoustic Library</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalCount} Tracks</h3>
              <p className="text-xs text-gray-500 mt-2">Analyzed and cached in database</p>
            </div>
            <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
              <Music className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:border-emerald-500/30 transition duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Library Energy</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-2">{stats.averageDNA.energy}%</h3>
              <p className="text-xs text-gray-500 mt-2">Average intensity index</p>
            </div>
            <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:border-emerald-500/30 transition duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Danceability</p>
              <h3 className="text-3xl font-bold text-pink-400 mt-2">{stats.averageDNA.danceability}%</h3>
              <p className="text-xs text-gray-500 mt-2">Average transient pulse clarity</p>
            </div>
            <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      {stats.totalCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center">
            <div className="w-full mb-4">
              <h3 className="text-base font-bold text-white">Average Music DNA Profile</h3>
              <p className="text-xs text-gray-500">Aggregated acoustic coordinates of your tracks</p>
            </div>

            <div className="w-full max-w-[320px] aspect-square flex items-center justify-center">
              <svg width="340" height="300" className="overflow-visible">
                {/* Concentric helper grids */}
                {gridOctagons.map((points, i) => (
                  <polygon
                    key={i}
                    points={points}
                    className="fill-none stroke-gray-800 stroke-[1]"
                  />
                ))}

                {/* Grid axis lines */}
                {axisLines.map((axis, i) => (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={axis.x}
                    y2={axis.y}
                    className="stroke-gray-850 stroke-[1] stroke-dashed"
                  />
                ))}

                {/* Labels */}
                {axisLines.map((axis, i) => (
                  <text
                    key={i}
                    x={axis.labelX}
                    y={axis.labelY}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-gray-400"
                  >
                    {axis.label}
                  </text>
                ))}

                {/* The Data Polygon */}
                <polygon
                  points={dataPoints}
                  className="fill-emerald-500/20 stroke-emerald-400 stroke-[2] transition-all duration-500"
                />
              </svg>
            </div>
          </div>

          {/* Tempo Distribution Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Tempo Distribution</h3>
              <p className="text-xs text-gray-500 mb-6">Grouping of library tracks by speed category</p>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="flex items-end justify-around h-44 border-b border-gray-800 pb-3 px-4 gap-6">
              {/* Chill */}
              <div className="flex flex-col items-center w-full group">
                <span className="text-xs font-mono font-bold text-emerald-400 mb-1 group-hover:scale-110 transition">
                  {chillVal}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg group-hover:opacity-90 transition-all duration-500"
                  style={{ height: `${(chillVal / maxTempoVal) * 120}px` }}
                />
                <span className="text-xs font-semibold text-white mt-2">Chill</span>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5">&lt; 90 BPM</span>
              </div>

              {/* Groove */}
              <div className="flex flex-col items-center w-full group">
                <span className="text-xs font-mono font-bold text-amber-400 mb-1 group-hover:scale-110 transition">
                  {grooveVal}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg group-hover:opacity-90 transition-all duration-500"
                  style={{ height: `${(grooveVal / maxTempoVal) * 120}px` }}
                />
                <span className="text-xs font-semibold text-white mt-2">Groove</span>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5">90-120 BPM</span>
              </div>

              {/* Energized */}
              <div className="flex flex-col items-center w-full group">
                <span className="text-xs font-mono font-bold text-red-400 mb-1 group-hover:scale-110 transition">
                  {energizedVal}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg group-hover:opacity-90 transition-all duration-500"
                  style={{ height: `${(energizedVal / maxTempoVal) * 120}px` }}
                />
                <span className="text-xs font-semibold text-white mt-2">Energized</span>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5">120+ BPM</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 text-center max-w-xl min-h-[300px] flex flex-col items-center justify-center mx-auto">
          <Activity className="h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Your library is currently empty</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            To view acoustic metrics, upload a track and run a digital signal processing analysis.
          </p>
          <a
            href="/dashboard/upload"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            Upload a Track
          </a>
        </div>
      )}

      {/* Latest Track Aggregates Table */}
      {stats.totalCount > 0 && stats.latestTracks.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Recently Analyzed Tracks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/20">
                  <th className="p-3 font-semibold text-gray-400">Song Name</th>
                  <th className="p-3 font-semibold text-gray-400">Tempo</th>
                  <th className="p-3 font-semibold text-gray-400 text-center">Energy</th>
                  <th className="p-3 font-semibold text-gray-400 text-center">Danceability</th>
                  <th className="p-3 font-semibold text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {stats.latestTracks.map((track) => (
                  <tr key={track.id} className="hover:bg-gray-950/10 transition-colors duration-150">
                    <td className="p-3 font-medium text-white truncate max-w-xs md:max-w-md">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playTrack({ id: track.id, name: track.filename, url: track.url || "" })}
                          disabled={!track.url}
                          className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="h-3 w-3 fill-current" />
                          ) : (
                            <Play className="h-3 w-3 fill-current ml-0.5" />
                          )}
                        </button>
                        <span className="truncate">{track.filename}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-400 font-mono">
                      {Math.round(track.tempo)} BPM
                    </td>
                    <td className="p-3 text-center font-mono text-red-400 font-semibold">
                      {track.energy}%
                    </td>
                    <td className="p-3 text-center font-mono text-pink-400 font-semibold">
                      {track.danceability}%
                    </td>
                    <td className="p-3 text-right">
                      <a
                        href="/dashboard/analysis"
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                      >
                        Open Library
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
