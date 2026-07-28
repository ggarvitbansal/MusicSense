import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Upload Audio</h2>
        <p className="text-gray-400 mt-1">Add tracks to your library to start the AI analysis pipeline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
            <Upload className="h-8 w-8" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">Drag and drop your audio files</h3>
          <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
            Support for MP3, WAV, and FLAC formats. Maximum file size is 50MB.
          </p>

          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer">
            Select Files
          </Button>
        </div>

        {/* Info Sidebar Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Processing Pipeline</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-emerald-450 shrink-0">1</div>
              <div>
                <h4 className="text-sm font-medium text-white">File Validation</h4>
                <p className="text-xs text-gray-400 mt-0.5">We check format compatibility and metadata completeness.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-emerald-450 shrink-0">2</div>
              <div>
                <h4 className="text-sm font-medium text-white">Feature Extraction</h4>
                <p className="text-xs text-gray-400 mt-0.5">ML models analyze audio characteristics, tempo, and key details.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-emerald-450 shrink-0">3</div>
              <div>
                <h4 className="text-sm font-medium text-white">DNA Generation</h4>
                <p className="text-xs text-gray-400 mt-0.5">A unique acoustic DNA is generated and added to your dashboard.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-normal">
              Uploading tracks uses private local processing models first. We do not store or distribute copyrighted media files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
