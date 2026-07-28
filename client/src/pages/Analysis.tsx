import { useEffect, useState } from "react";
import { Play, Loader2, Library, AlertCircle, ArrowLeft, Trash2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import API from "@/services/api";
import {
  SongOverview,
  MusicDNASection,
  FeatureSummary,
  TechnicalDetails,
  ComingSoonSection,
} from "@/components/dashboard";

interface AudioFile {
  id: string;
  originalName: string;
  size: number;
  status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

interface AnalysisRecord {
  id: string;
  audioFileId: string;
  filename: string;
  metadata: {
    duration: number;
    sampleRate: number;
    channels: number;
    tempo?: number;
    rms?: number[];
    zero_crossing_rate?: number[];
    spectral_centroid?: number[];
    spectral_bandwidth?: number[];
    rolloff?: number[];
    mfcc?: number[];
    chroma?: number[];
    spectral_contrast?: number[];
    harmonic_energy?: number;
    percussive_energy?: number;
    silence_ratio?: number;
  };
  musicDNA: {
    energy: number;
    brightness: number;
    rhythm: number;
    harmonicRichness: number;
    danceability: number;
    acousticness: number;
    complexity: number;
    silence: number;
  };
  createdAt: string;
}

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<"history" | "library">("history");
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [uploads, setUploads] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedTrack, setSelectedTrack] = useState<{ id: string; originalName: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisRecord | null>(null);

  // Fetch both analysis history and raw library uploads
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [historyRes, uploadsRes] = await Promise.all([
        API.get("/analysis"),
        API.get("/uploads")
      ]);
      
      if (historyRes.data?.success) {
        setHistory(historyRes.data.data);
      }
      if (uploadsRes.data?.success) {
        setUploads(uploadsRes.data.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Failed to load analysis history. Ensure you are signed in."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnalyze = async (track: AudioFile) => {
    setSelectedTrack({ id: track.id, originalName: track.originalName });
    setAnalyzing(true);
    setAnalysisError("");
    setAnalysisData(null);

    try {
      const res = await API.post(`/uploads/${track.id}/analyze`);
      if (res.data?.success && res.data?.data) {
        setAnalysisData(res.data.data);
        await fetchData(); // Refresh local list
      } else {
        throw new Error("Invalid response format received from analysis engine.");
      }
    } catch (err: any) {
      setAnalysisError(
        err.response?.data?.message ||
        "Failed to analyze track. Ensure the ML FastAPI service is online."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewAnalysis = (record: AnalysisRecord) => {
    setSelectedTrack({ id: record.audioFileId, originalName: record.filename });
    setAnalysisData(record);
  };

  const handleDeleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this analysis record?")) return;
    
    try {
      const res = await API.delete(`/analysis/${id}`);
      if (res.data?.success) {
        await fetchData(); // Refresh local list
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete analysis.");
    }
  };

  const handleBackToHistory = () => {
    setSelectedTrack(null);
    setAnalysisData(null);
    setAnalysisError("");
  };

  const formatSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  // 1. Loading active analysis state
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 text-center">
        <Loader2 className="h-16 w-16 text-emerald-500 animate-spin" />
        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-bold text-white">Analyzing "{selectedTrack?.originalName}"</h3>
          <p className="text-gray-400 text-sm animate-pulse">
            Extracting spectrogram representations, running digital signal processing models, and compiling Music DNA...
          </p>
        </div>
      </div>
    );
  }

  // 2. Render completed analysis dashboard
  if (analysisData) {
    const { metadata, musicDNA } = analysisData;
    const rawDetails = {
      rmsLength: metadata.rms?.length,
      zcrLength: metadata.zero_crossing_rate?.length,
      centroidLength: metadata.spectral_centroid?.length,
      rolloffLength: metadata.rolloff?.length,
    };

    return (
      <div className="space-y-8 pb-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBackToHistory}
            className="flex items-center gap-2 text-sm font-semibold bg-gray-900 border border-gray-800 hover:border-gray-750 text-gray-300 hover:text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>

          <span className="text-xs text-gray-500 font-mono bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
            Analysis ID: {analysisData.id}
          </span>
        </div>

        {/* Section 1: Song Overview */}
        <SongOverview
          filename={analysisData.filename || "Unknown Track"}
          duration={metadata.duration}
          sampleRate={metadata.sampleRate}
          channels={metadata.channels}
          tempo={metadata.tempo || 0}
        />

        {/* Section 2: Music DNA */}
        <MusicDNASection dna={musicDNA} />

        {/* Section 3: Audio Feature Summary */}
        <FeatureSummary
          rms={metadata.rms || null}
          centroid={metadata.spectral_centroid || null}
          bandwidth={metadata.spectral_bandwidth || null}
          rolloff={metadata.rolloff || null}
          harmonicEnergy={metadata.harmonic_energy || null}
          percussiveEnergy={metadata.percussive_energy || null}
          silenceRatio={metadata.silence_ratio || null}
        />

        {/* Section 4: Technical Details */}
        <TechnicalDetails
          mfcc={metadata.mfcc || null}
          chroma={metadata.chroma || null}
          contrast={metadata.spectral_contrast || null}
          rawDetails={rawDetails}
        />

        {/* Section 5: Future Intelligence */}
        <ComingSoonSection />
      </div>
    );
  }

  // 3. Render analysis error
  if (analysisError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Analysis Failed</h3>
          <p className="text-red-400 text-sm leading-relaxed">{analysisError}</p>
        </div>
        <Button
          onClick={handleBackToHistory}
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer"
        >
          Return to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Acoustic Analysis</h2>
          <p className="text-gray-400 mt-1">
            Deep digital signal processing and semantic Music DNA profiling.
          </p>
        </div>
        <Button
          onClick={fetchData}
          disabled={loading}
          className="bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 text-sm max-w-2xl">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-800 gap-6">
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 font-semibold text-sm transition-all focus:outline-none cursor-pointer ${
            activeTab === "history"
              ? "text-emerald-400 border-b-2 border-emerald-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Analysis History ({history.length})
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`pb-3 font-semibold text-sm transition-all focus:outline-none cursor-pointer ${
            activeTab === "library"
              ? "text-emerald-400 border-b-2 border-emerald-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Uploads Library ({uploads.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : activeTab === "history" ? (
        history.length === 0 ? (
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 text-center max-w-xl min-h-[250px] flex flex-col items-center justify-center mx-auto">
            <BarChart2 className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No songs analyzed yet</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              To build your Music DNA profile, choose an uploaded track from your library and trigger the analysis.
            </p>
            <a
              href="/dashboard/upload"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Upload Your First Song
            </a>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-800/80 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-950/40">
                    <th className="p-4 font-semibold text-gray-400">Song Name</th>
                    <th className="p-4 font-semibold text-gray-400">Date Analyzed</th>
                    <th className="p-4 font-semibold text-gray-400">Duration</th>
                    <th className="p-4 font-semibold text-gray-400">Tempo</th>
                    <th className="p-4 font-semibold text-gray-400">Energy</th>
                    <th className="p-4 font-semibold text-gray-400">Danceability</th>
                    <th className="p-4 font-semibold text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {history.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => handleViewAnalysis(record)}
                      className="hover:bg-gray-950/15 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-medium text-white truncate max-w-xs md:max-w-md">
                        {record.filename}
                      </td>
                      <td className="p-4 text-gray-400 font-mono">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-400 font-mono">
                        {formatDuration(record.metadata.duration)}
                      </td>
                      <td className="p-4 text-gray-400 font-mono">
                        {record.metadata.tempo ? `${Math.round(record.metadata.tempo)} BPM` : "N/A"}
                      </td>
                      <td className="p-4 font-mono font-semibold text-red-400">
                        {Math.round(record.musicDNA.energy)}
                      </td>
                      <td className="p-4 font-mono font-semibold text-pink-400">
                        {Math.round(record.musicDNA.danceability)}
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={() => handleViewAnalysis(record)}
                          className="bg-emerald-650 hover:bg-emerald-700 text-white font-semibold px-3 py-1 rounded-lg text-xs cursor-pointer"
                        >
                          View Analysis
                        </Button>
                        <button
                          onClick={(e) => handleDeleteAnalysis(record.id, e)}
                          title="Delete Analysis"
                          className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-500/15"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : uploads.length === 0 ? (
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 text-center max-w-xl min-h-[250px] flex flex-col items-center justify-center mx-auto">
          <Library className="h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No uploads found</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Upload audio files first to populate your library and run calculations.
          </p>
          <a
            href="/dashboard/upload"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            Upload Audio Files
          </a>
        </div>
      ) : (
        <div className="bg-gray-900/30 border border-gray-800/80 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/40">
                  <th className="p-4 font-semibold text-gray-400">Filename</th>
                  <th className="p-4 font-semibold text-gray-400">File Size</th>
                  <th className="p-4 font-semibold text-gray-400">Status</th>
                  <th className="p-4 font-semibold text-gray-400">Date Added</th>
                  <th className="p-4 font-semibold text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {uploads.map((upload) => (
                  <tr key={upload.id} className="hover:bg-gray-950/10 transition-colors">
                    <td className="p-4 font-medium text-white truncate max-w-xs md:max-w-md">
                      {upload.originalName}
                    </td>
                    <td className="p-4 text-gray-400 font-mono">
                      {formatSize(upload.size)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          upload.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : upload.status === "PROCESSING"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : upload.status === "FAILED"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-gray-800 text-gray-400 border-gray-700"
                        }`}
                      >
                        {upload.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 font-mono">
                      {new Date(upload.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        onClick={() => handleAnalyze(upload)}
                        disabled={upload.status === "PROCESSING"}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-55"
                      >
                        <Play className="h-3.5 w-3.5 mr-1 inline-block shrink-0" />
                        {upload.status === "COMPLETED" ? "Re-Analyze" : "Analyze"}
                      </Button>
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
