import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 bg-black/95 border-t border-gray-900" aria-label="Call to Action">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to discover your <span className="text-emerald-500">Music DNA?</span>
          </h2>
          
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join MusicSense today. Upload your music library and unlock immediate, deep analytical insights about your collection.
          </p>

          <div className="pt-2">
            <Button
              onClick={() => navigate("/register")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg text-base transition-colors cursor-pointer"
              aria-label="Get Started with MusicSense"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
