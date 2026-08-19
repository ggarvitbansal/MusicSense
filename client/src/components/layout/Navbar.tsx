import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sectionIds = ["hero", "features", "about"];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry && entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [location.pathname]);

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems = [
    { name: "Home", target: "hero" },
    { name: "Features", target: "features" },
    { name: "About", target: "about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink 
              to={isLoggedIn ? "/dashboard" : "/"} 
              className="text-2xl font-bold tracking-tight text-white hover:text-emerald-450 transition-colors"
              aria-label="MusicSense Home"
            >
              Music<span className="text-emerald-500">Sense</span>
            </NavLink>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.target)}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    activeSection === item.target && location.pathname === "/"
                      ? "text-emerald-400 font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                  aria-label={`Scroll to ${item.name}`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4 border-l border-gray-800 pl-6">
              {isLoggedIn ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  aria-label="Go to Dashboard"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${
                        isActive ? "text-emerald-400 font-semibold" : "text-gray-400 hover:text-white"
                      }`
                    }
                    aria-label="Navigate to Login"
                  >
                    Login
                  </NavLink>
                  <Button
                    onClick={() => navigate("/register")}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    aria-label="Get Started with MusicSense"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-900 hover:text-white focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black px-2 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.target)}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ${
                activeSection === item.target && location.pathname === "/"
                  ? "text-emerald-400 bg-gray-900"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
              aria-label={`Scroll to ${item.name}`}
            >
              {item.name}
            </button>
          ))}
          <div className="border-t border-gray-800 my-2 pt-2 px-3 space-y-2">
            {isLoggedIn ? (
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Go to Dashboard"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block w-full py-2 text-base font-medium transition-colors ${
                      isActive ? "text-emerald-400" : "text-gray-400 hover:text-white"
                    }`
                  }
                  aria-label="Navigate to Login"
                >
                  Login
                </NavLink>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/register");
                  }}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                  aria-label="Get Started with MusicSense"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
