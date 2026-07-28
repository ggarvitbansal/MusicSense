import { useLocation } from "react-router-dom";
import { Menu, User } from "lucide-react";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export default function Topbar({ onOpenSidebar }: TopbarProps) {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/dashboard/upload":
        return "Upload Audio";
      case "/dashboard/analysis":
        return "Acoustic Analysis";
      case "/dashboard/settings":
        return "Settings";
      default:
        return "MusicSense";
    }
  };

  return (
    <header className="h-16 border-b border-gray-900 bg-gray-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-900 hover:text-white focus:outline-none"
          aria-label="Open Sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Profile/User Menu Placeholder */}
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-sm text-gray-400 font-medium">Guest User</span>
        <div 
          className="w-8 h-8 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center cursor-pointer"
          role="img"
          aria-label="User profile avatar"
        >
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
