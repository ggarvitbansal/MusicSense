import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AudioPlayer from "./AudioPlayer";

export default function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 md:pl-64">
        {/* Top Header Bar */}
        <Topbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dashboard Content Outlet */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto pb-24" role="main">
          <Outlet />
        </main>
      </div>

      {/* Global Audio Player Bar */}
      <AudioPlayer />
    </div>
  );
}

