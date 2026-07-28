import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="text-8xl font-black text-emerald-600 mb-4">404</div>
        <h2 className="text-3xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mb-8">
          The page you are looking for doesn't exist, has been removed, or has had its name changed.
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
