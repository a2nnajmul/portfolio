import { FadeIn } from "@/components/FadeIn";
import { ExternalLink, Maximize2 } from "lucide-react";

const portfolioItems = [
  { id: 1, title: "Brand Identity", category: "Branding", gradient: "from-orange-400 to-rose-500" },
  { id: 2, title: "Mobile UI Design", category: "UI/UX", gradient: "from-blue-500 to-indigo-600" },
  { id: 3, title: "Creative Flyer", category: "Graphic Design", gradient: "from-emerald-400 to-cyan-500" },
  { id: 4, title: "Logo Design", category: "Branding", gradient: "from-purple-500 to-fuchsia-600" },
  { id: 5, title: "Social Media Post", category: "Marketing", gradient: "from-pink-500 to-rose-500" },
  { id: 6, title: "T-Shirt Design", category: "Merchandise", gradient: "from-amber-400 to-orange-500" },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            My <span className="text-gradient">Portfolio</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A selection of my recent design projects demonstrating my expertise in branding, UI/UX, and graphic layouts.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {portfolioItems.map((item, i) => (
            <FadeIn key={item.id} delay={(i % 3 + 1) * 100}>
              <div className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-lg bg-card border border-border">
                {/* Simulated Image Background with Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-80 group-hover:scale-110 transition-transform duration-700 ease-out`} />
                
                {/* Overlay Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-50" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-primary font-medium text-sm mb-2 block">{item.category}</span>
                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                    <div className="flex gap-3">
                      <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-primary transition-colors">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-primary transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Default state title (visible when not hovered) */}
                <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                   <h3 className="text-3xl font-display font-bold text-white/90 drop-shadow-md text-center px-4">{item.title}</h3>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={300} className="mt-16 text-center">
          <button className="px-8 py-4 rounded-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 mx-auto group">
            View More Projects
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </FadeIn>

      </div>
    </section>
  );
}
