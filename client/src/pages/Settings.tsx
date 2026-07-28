import { Sliders, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-gray-400 mt-1">Configure your MusicSense dashboard preferences and models.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Tabs on Left */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col space-y-2 h-fit">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-emerald-400 bg-emerald-600/10 text-left w-full cursor-pointer">
            <Sliders className="h-4 w-4" />
            General Preferences
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-450 hover:bg-gray-800 hover:text-white text-left w-full cursor-pointer">
            <Shield className="h-4 w-4" />
            Security & Privacy
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-450 hover:bg-gray-800 hover:text-white text-left w-full cursor-pointer">
            <Info className="h-4 w-4" />
            About System
          </button>
        </div>

        {/* Configurations Form on Right */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Analysis Preferences</h3>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-white">Local Spectrogram Cache</label>
                  <p className="text-xs text-gray-400 mt-0.5">Speed up future uploads by caching extracted features locally.</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-700 rounded focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                <div>
                  <label className="block text-sm font-medium text-white">Advanced Signal Processing</label>
                  <p className="text-xs text-gray-400 mt-0.5">Enable high-resolution Librosa filters during analysis.</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-700 rounded focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Model Selection</h3>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Default Classifier</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition">
                  <option>TensorFlow Audio Spectrogram Model v2.1 (Default)</option>
                  <option>Lightweight Genre Predictor v1.4 (Fast)</option>
                  <option>Experimental Mood Classifier v3.0 (Detailed)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" className="border-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer">
              Reset Defaults
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
