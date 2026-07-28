import { useState } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";

interface TechnicalDetailsProps {
  mfcc: number[] | null;
  chroma: number[] | null;
  contrast: number[] | null;
  rawDetails: {
    rmsLength?: number;
    zcrLength?: number;
    centroidLength?: number;
    rolloffLength?: number;
  };
}

export default function TechnicalDetails({
  mfcc,
  chroma,
  contrast,
  rawDetails,
}: TechnicalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-900/30 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-800/20 transition-colors focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-emerald-400" />
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">Technical Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Inspect timbral, chromatic cepstra matrices and waveform vectors
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-gray-850/60 bg-gray-950/15 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MFCC Coefficients */}
            <div className="bg-gray-950/40 border border-gray-800/60 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-800 pb-2">
                13 Mel-Frequency Cepstral Coefficients (MFCCs)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                {mfcc ? (
                  mfcc.map((coef, i) => (
                    <div key={i} className="flex justify-between p-1 bg-gray-900/20 rounded border border-gray-800/30">
                      <span className="text-gray-500">MFCC {i}</span>
                      <span className="text-emerald-400 font-semibold">{coef.toFixed(4)}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">No MFCCs extracted</span>
                )}
              </div>
            </div>

            {/* Chroma Features */}
            <div className="bg-gray-950/40 border border-gray-800/60 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-800 pb-2">
                12 Chroma STFT Semitone Means
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                {chroma ? (
                  chroma.map((bin, i) => {
                    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
                    return (
                      <div key={i} className="flex justify-between p-1 bg-gray-900/20 rounded border border-gray-800/30">
                        <span className="text-gray-500">{notes[i] || `Bin ${i}`}</span>
                        <span className="text-cyan-400 font-semibold">{bin.toFixed(4)}</span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-gray-500">No Chroma features extracted</span>
                )}
              </div>
            </div>

            {/* Spectral Contrast */}
            <div className="bg-gray-950/40 border border-gray-800/60 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-800 pb-2">
                7 Spectral Contrast Subbands (dB)
              </span>
              <div className="grid grid-cols-1 gap-2 text-[11px] font-mono">
                {contrast ? (
                  contrast.map((band, i) => (
                    <div key={i} className="flex justify-between p-1 bg-gray-900/20 rounded border border-gray-800/30">
                      <span className="text-gray-500">Band {i}</span>
                      <span className="text-purple-400 font-semibold">{band.toFixed(4)} dB</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">No Spectral Contrast extracted</span>
                )}
              </div>
            </div>
          </div>

          {/* Raw DSP Vector Sizes */}
          <div className="bg-gray-950/40 border border-gray-800/60 rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-800 pb-2">
              Raw Waveform Vector Allocations
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-gray-900/20 rounded border border-gray-800/30">
                <span className="text-gray-500 block text-[10px] uppercase">RMS Buffer</span>
                <span className="text-white font-bold text-sm mt-1 block">
                  {rawDetails.rmsLength ? `${rawDetails.rmsLength.toLocaleString()} frames` : "N/A"}
                </span>
              </div>
              <div className="p-3 bg-gray-900/20 rounded border border-gray-800/30">
                <span className="text-gray-500 block text-[10px] uppercase">ZCR Buffer</span>
                <span className="text-white font-bold text-sm mt-1 block">
                  {rawDetails.zcrLength ? `${rawDetails.zcrLength.toLocaleString()} frames` : "N/A"}
                </span>
              </div>
              <div className="p-3 bg-gray-900/20 rounded border border-gray-800/30">
                <span className="text-gray-500 block text-[10px] uppercase">Centroid Buffer</span>
                <span className="text-white font-bold text-sm mt-1 block">
                  {rawDetails.centroidLength ? `${rawDetails.centroidLength.toLocaleString()} frames` : "N/A"}
                </span>
              </div>
              <div className="p-3 bg-gray-900/20 rounded border border-gray-800/30">
                <span className="text-gray-500 block text-[10px] uppercase">Rolloff Buffer</span>
                <span className="text-white font-bold text-sm mt-1 block">
                  {rawDetails.rolloffLength ? `${rawDetails.rolloffLength.toLocaleString()} frames` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
