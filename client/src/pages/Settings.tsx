import { useState, useEffect } from "react";
import { Sliders, Shield, Info, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import API from "@/services/api";

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState(true);
  const [preferredModel, setPreferredModel] = useState("TENSORFLOW");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get("/settings");
        if (res.data?.success && res.data?.data) {
          const { theme, notifications, preferredModel } = res.data.data;
          setTheme(theme || "dark");
          setNotifications(notifications !== false);
          setPreferredModel(preferredModel || "TENSORFLOW");
        }
      } catch (err: any) {
        setError("Failed to load user settings. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const res = await API.put("/settings", {
        theme,
        notifications,
        preferredModel,
      });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save user settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTheme("dark");
    setNotifications(true);
    setPreferredModel("TENSORFLOW");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-gray-400 mt-1">Configure your MusicSense dashboard preferences and models.</p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-3 text-sm flex items-center gap-2 max-w-2xl">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm flex items-center gap-2 max-w-2xl">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Tabs on Left */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col space-y-2 h-fit">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-emerald-400 bg-emerald-600/10 text-left w-full cursor-pointer">
            <Sliders className="h-4 w-4" />
            General Preferences
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white text-left w-full cursor-pointer">
            <Shield className="h-4 w-4" />
            Security & Privacy
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white text-left w-full cursor-pointer">
            <Info className="h-4 w-4" />
            About System
          </button>
        </div>

        {/* Configurations Form on Right */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Interface Preferences */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">General Preferences</h3>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-white">Dark Theme</label>
                  <p className="text-xs text-gray-400 mt-0.5">Toggle interface dark theme mode settings.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={theme === "dark"} 
                  onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                  className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-700 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                <div>
                  <label className="block text-sm font-medium text-white">System Notifications</label>
                  <p className="text-xs text-gray-400 mt-0.5">Receive browser and email updates when analysis finishes.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-700 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Model Configuration */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Model Selection</h3>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Default Classifier</label>
                <select 
                  value={preferredModel}
                  onChange={(e) => setPreferredModel(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer"
                >
                  <option value="TENSORFLOW">TensorFlow Audio Spectrogram Model v2.1 (Default)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="border-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer"
            >
              Reset Defaults
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer disabled:opacity-55 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
