import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative overflow-hidden pt-24 pb-20 lg:pt-36 lg:pb-32 bg-black" aria-label="Hero Section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Text Content */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6 flex flex-col justify-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Acoustic Intelligence for <br className="hidden sm:inline" />
            <span className="text-emerald-500">Your Local Music Library</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Extract deep acoustic features, analyze tempo profiles, predict genres and moods, and discover your music DNA using private, machine learning-driven analytics.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
            <Button
              onClick={() => navigate("/register")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg text-base transition-colors cursor-pointer"
              aria-label="Get Started with MusicSense"
            >
              Get Started
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById("features");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-transparent border border-gray-800 text-white hover:bg-gray-900 hover:border-gray-700 font-semibold px-8 py-3 rounded-lg text-base transition-colors cursor-pointer"
              aria-label="Learn more about features"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Illustration Placeholder */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div 
            className="w-full max-w-md aspect-square bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center p-8 shadow-sm"
            role="img"
            aria-label="Acoustic waveform analysis chart illustration"
          >
            <svg 
              viewBox="0 0 200 200" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-full h-full text-emerald-500"
              aria-hidden="true"
            >
              {/* Grid lines */}
              <line x1="10" y1="100" x2="190" y2="100" stroke="#1f2937" strokeWidth="1" />
              <line x1="100" y1="10" x2="100" y2="190" stroke="#1f2937" strokeWidth="1" />
              
              {/* Waveform / Chart line */}
              <path 
                d="M 10 120 C 30 110, 50 60, 70 80 C 90 100, 110 140, 130 110 C 150 80, 170 130, 190 90" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeLinejoin="round" 
              />
              
              {/* Decorative data points */}
              <circle cx="70" cy="80" r="4" fill="currentColor" />
              <circle cx="130" cy="110" r="4" fill="#34d399" />
              <circle cx="190" cy="90" r="4" fill="currentColor" />

              {/* Surrounding music nodes */}
              <circle cx="40" cy="40" r="2" fill="#374151" />
              <circle cx="160" cy="40" r="3" fill="#374151" />
              <circle cx="160" cy="160" r="2" fill="#374151" />
              <circle cx="40" cy="160" r="3" fill="#374151" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
