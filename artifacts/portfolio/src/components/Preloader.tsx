import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Fade out after 1.5s or window load
    const handleLoad = () => {
      setIsFading(true);
      setTimeout(() => setIsLoading(false), 500);
    };

    const timer = setTimeout(handleLoad, 1500);
    
    if (document.readyState === "complete") {
      clearTimeout(timer);
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500",
        isFading ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 border-4 border-muted rounded-full"></div>
        <div className="absolute w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="w-12 h-12 bg-primary/20 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
