import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AudioPlayer from "./AudioPlayer";
import API from "@/services/api";

interface UserProfile {
  name: string;
  email: string;
}

export default function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await API.get("/auth/me");
        if (res.data?.success && res.data?.data) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 text-emerald-500 animate-spin border-4 border-emerald-500 border-t-transparent rounded-full" />
          <p className="text-gray-400 text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

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
        <Topbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} user={user} />

        {/* Dashboard Content Outlet */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto pb-36" role="main">
          <Outlet />
        </main>
      </div>

      {/* Global Audio Player Bar */}
      <AudioPlayer />
    </div>
  );
}

