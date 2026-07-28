import { Disc, Zap } from "lucide-react";

export default function AnalysisPage() {
  const stats = [
    { label: "Tempo Range", value: "84 - 142 BPM", description: "Average: 112 BPM" },
    { label: "Dominant Mood", value: "Energetic / Uplifting", description: "Based on valence & energy" },
    { label: "Key Signatures", value: "C Minor / G Major", description: "Most common in library" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Acoustic Analysis</h2>
        <p className="text-gray-400 mt-1">Deep machine learning insights based on your uploaded tracks.</p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Prediction Mockup */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Disc className="h-6 w-6 text-emerald-500" />
            <h3 className="text-lg font-semibold text-white">AI Genre Profile</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Electronic / Synthwave</span>
                <span className="text-emerald-400 font-semibold">45%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "45%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Indie Pop</span>
                <span className="text-emerald-400 font-semibold">28%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "28%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Ambient / Downtempo</span>
                <span className="text-emerald-400 font-semibold">17%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "17%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Rock / Alternative</span>
                <span className="text-emerald-400 font-semibold">10%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Audio Feature Spectrum */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-emerald-500" />
            <h3 className="text-lg font-semibold text-white">Audio Feature Spectrum</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Danceability</span>
                <span className="text-gray-400">High</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "72%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Energy</span>
                <span className="text-gray-400">Moderate</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "58%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Acousticness</span>
                <span className="text-gray-400">Low</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "22%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Speechiness</span>
                <span className="text-gray-400">Very Low</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
