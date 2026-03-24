import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS = ["Home", "About", "Skills", "Experience", "Portfolio", "Contact"];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Scroll spy logic
      const sections = NAV_LINKS.map(link => document.getElementById(link.toLowerCase()));
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(NAV_LINKS[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id.toLowerCase());
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Offset for sticky header
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollTo("home")}>
            <span className="font-display font-bold text-2xl tracking-tight">
              Najmul A<span className="text-primary">.</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {NAV_LINKS.map((link) => (
                <button
                  key={link}
                  onClick={() => scrollTo(link)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative py-1",
                    activeSection === link ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {link}
                  {activeSection === link && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-fade-in" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4 pl-4 border-l border-border/50">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => scrollTo("contact")}
                className="px-5 py-2 rounded-full font-medium bg-gradient-to-r from-primary to-[#ea580c] text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                Hire Me
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-foreground/80"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 w-full glass-card border-x-0 transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-96 py-4 opacity-100" : "max-h-0 py-0 opacity-0 border-y-0"
        )}
      >
        <div className="flex flex-col space-y-4 px-6">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className={cn(
                "text-left text-lg font-medium py-2 transition-colors",
                activeSection === link ? "text-primary" : "text-foreground/80"
              )}
            >
              {link}
            </button>
          ))}
          <button
            onClick={() => scrollTo("contact")}
            className="mt-4 px-5 py-3 w-full rounded-xl font-medium bg-primary text-white shadow-lg shadow-primary/25"
          >
            Hire Me
          </button>
        </div>
      </div>
    </nav>
  );
}
