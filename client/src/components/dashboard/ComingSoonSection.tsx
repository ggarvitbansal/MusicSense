import ComingSoonCard from "./ComingSoonCard";
import { Disc, Heart, Fingerprint, GitCompare, ListMusic } from "lucide-react";

export default function ComingSoonSection() {
  const cards = [
    {
      title: "Genre Prediction",
      icon: <Disc className="h-5 w-5 text-gray-500" />,
      description: "Probabilistic classification model mapping tracks to primary genres."
    },
    {
      title: "Mood Analysis",
      icon: <Heart className="h-5 w-5 text-gray-500" />,
      description: "Valence-Arousal grid positioning tracks on the emotional coordinate scale."
    },
    {
      title: "Music Genome",
      icon: <Fingerprint className="h-5 w-5 text-gray-500" />,
      description: "128-dimensional dense vector embeddings for spatial search spaces."
    },
    {
      title: "Similar Songs",
      icon: <GitCompare className="h-5 w-5 text-gray-500" />,
      description: "Nearest-neighbor geometric queries mapping track clusters."
    },
    {
      title: "Playlist Intelligence",
      icon: <ListMusic className="h-5 w-5 text-gray-500" />,
      description: "Automated transition blending and seed-based playlist generation."
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Future Intelligence</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Machine learning and cognitive features scheduled for upcoming platform sprints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <ComingSoonCard
            key={i}
            title={card.title}
            icon={card.icon}
            description={card.description}
          />
        ))}
      </div>
    </div>
  );
}
