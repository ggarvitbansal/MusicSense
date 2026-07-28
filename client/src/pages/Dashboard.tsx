export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Your Dashboard</h2>
        <p className="text-gray-400 mt-1">Here is your daily personalized music digest.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recommendation Card 1 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:border-emerald-500 transition-colors duration-300">
          <div className="w-12 h-12 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4">
            🎵
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Daily Vibe Match</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Fresh tracks curated matching your recent listening activity. Updated every 24 hours.
          </p>
        </div>

        {/* Recommendation Card 2 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:border-emerald-500 transition-colors duration-300">
          <div className="w-12 h-12 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4">
            🎧
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Mood Analyzer</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Select your current mood to dynamically change recommendation vectors.
          </p>
        </div>

        {/* Recommendation Card 3 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm hover:border-emerald-500 transition-colors duration-300">
          <div className="w-12 h-12 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold text-xl mb-4">
            📈
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Listening Stats</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Discover your top genres, artists, and tempo ranges over the last week.
          </p>
        </div>
      </div>
    </div>
  );
}
