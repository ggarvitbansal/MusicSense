import { Music, Brain, BarChart3 } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function Features() {
  const features = [
    {
      icon: <Music className="h-6 w-6" aria-hidden="true" />,
      title: "Music Intelligence",
      description: "Extract deep acoustic features including tempo, key, energy, and density from your local music library.",
    },
    {
      icon: <Brain className="h-6 w-6" aria-hidden="true" />,
      title: "AI Insights",
      description: "Classify your tracks by mood and genre using advanced machine learning models trained on audio spectrograms.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" aria-hidden="true" />,
      title: "Listening Analytics",
      description: "Visualize patterns in your listening collection through comprehensive charts, timelines, and statistics.",
    },
  ];

  return (
    <section id="features" className="py-24 lg:py-32 bg-black/95 border-t border-gray-900" aria-labelledby="features-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 id="features-title" className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Powering Your Music Discovery
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            MusicSense uses custom AI models to analyze audio characteristics directly, offering depth that simple tagging cannot provide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
