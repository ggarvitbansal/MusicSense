import { useRef, useState } from "react";
import { Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import API from "@/services/api";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setStatus("uploading");
    setErrorMessage("");
    setProgress(0);

    const formData = new FormData();
    formData.append("audio", file); // Must match backend field name

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to upload files. Please register or sign in first.");
      }

      const res = await API.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      if (res.data?.success) {
        setStatus("success");
        setUploadedFile(file.name);
        setTimeout(() => {
          navigate("/dashboard/analysis");
        }, 1500);
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        "Failed to upload audio file. Ensure the file size is under 25MB and in a valid format."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Upload Audio</h2>
        <p className="text-gray-400 mt-1">Add tracks to your library to start the AI analysis pipeline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".mp3,.wav,.flac,.m4a,.ogg"
            className="hidden"
          />

          {status === "idle" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Select your audio files</h3>
              <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
                Support for MP3, WAV, FLAC, OGG, and M4A formats. Maximum file size is 25MB.
              </p>
              <Button
                onClick={handleSelectClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Select File
              </Button>
            </>
          )}

          {status === "uploading" && (
            <div className="space-y-4 w-full max-w-xs">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
              <h3 className="text-lg font-semibold text-white">Uploading track...</h3>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{progress}% complete</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 mx-auto animate-pulse">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-white">Upload Successful!</h3>
              <p className="text-gray-400 text-sm">
                Successfully uploaded <span className="text-emerald-400 font-semibold">{uploadedFile}</span>.
              </p>
              <p className="text-xs text-gray-500">Redirecting to analysis dashboard...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6 mx-auto">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-white">Upload Failed</h3>
              <p className="text-red-400 text-sm leading-relaxed">{errorMessage}</p>
              <Button
                onClick={() => setStatus("idle")}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Info Sidebar Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Processing Pipeline</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-emerald-400 shrink-0">1</div>
              <div>
                <h4 className="text-sm font-medium text-white">File Ingestion</h4>
                <p className="text-xs text-gray-400 mt-0.5">We check format compatibility and enforce file size parameters.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-emerald-400 shrink-0">2</div>
              <div>
                <h4 className="text-sm font-medium text-white">Feature Extraction</h4>
                <p className="text-xs text-gray-400 mt-0.5">Digital signal processing (DSP) computes tempo, timbre, and chroma frequencies.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-emerald-400 shrink-0">3</div>
              <div>
                <h4 className="text-sm font-medium text-white">DNA Compilation</h4>
                <p className="text-xs text-gray-400 mt-0.5">A deterministic semantic Music DNA profile is generated and visualized.</p>
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
