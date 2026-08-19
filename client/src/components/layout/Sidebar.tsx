import { NavLink } from "react-router-dom";
import { LayoutDashboard, UploadCloud, Activity, Settings, X, LogOut } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Upload", path: "/dashboard/upload", icon: <UploadCloud className="h-5 w-5" /> },
    { name: "Analysis", path: "/dashboard/analysis", icon: <Activity className="h-5 w-5" /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-900 flex flex-col transition-transform duration-300 transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Header/Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-900">
          <NavLink to="/dashboard" className="text-xl font-bold tracking-tight text-white">
            Music<span className="text-emerald-500">Sense</span>
          </NavLink>
          {/* Close button on mobile */}
          <button 
            onClick={onClose} 
            className="md:hidden p-1 rounded-lg text-gray-400 hover:bg-gray-900 hover:text-white"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow px-4 py-6 flex flex-col justify-between" aria-label="Dashboard Navigation">
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-205 border border-transparent ${
                    isActive
                      ? "text-emerald-400 bg-emerald-600/10 border-emerald-500/10"
                      : "text-gray-400 hover:text-white hover:bg-gray-900"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition duration-200 border border-transparent cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-900 text-xs text-gray-550 text-center">
          MusicSense Dashboard v1.0
        </div>
      </aside>
    </>
  );
}
