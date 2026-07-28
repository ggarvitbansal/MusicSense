import { UploadCloud, Activity, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <UploadCloud className="h-6 w-6 text-emerald-500" aria-hidden="true" />,
      title: "Upload Audio",
      description: "Securely upload your MP3, WAV, or FLAC files directly through our web interface.",
    },
    {
      number: "02",
      icon: <Activity className="h-6 w-6 text-emerald-500" aria-hidden="true" />,
      title: "AI Analysis",
      description: "Our machine learning pipeline processes the audio signal, extracting features and metadata.",
    },
    {
      number: "03",
      icon: <Sparkles className="h-6 w-6 text-emerald-500" aria-hidden="true" />,
      title: "Discover Insights",
      description: "View your personalized dashboard filled with stats, mood maps, and music DNA profiles.",
    },
  ];

  return (
    <section id="about" className="py-24 lg:py-32 bg-black border-t border-gray-900" aria-labelledby="how-it-works-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 id="how-it-works-title" className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            How It Works
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Three simple steps to unlock the full potential of your music library.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (hidden on mobile, visible on desktop) */}
          <div className="hidden md:block absolute top-20 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/50 to-emerald-500/10 -z-10" />

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                {/* Step circle container */}
                <div 
                  className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center shadow-sm relative z-10"
                  role="img"
                  aria-label={`Step ${step.number}: ${step.title}`}
                >
                  {step.icon}
                </div>
                {/* Step indicator */}
                <span className="absolute -top-2 -right-2 text-xs font-bold bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center" aria-hidden="true">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white pt-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
