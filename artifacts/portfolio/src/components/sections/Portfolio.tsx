import { useQuery } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { ExternalLink, Maximize2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  link: string;
  gradient: string;
  featured: boolean;
}

const FALLBACK: Project[] = [
  { id: "1", title: "Brand Identity", category: "Branding", description: "", imageUrl: "", link: "", gradient: "from-orange-400 to-rose-500", featured: true },
  { id: "2", title: "Mobile UI Design", category: "UI/UX", description: "", imageUrl: "", link: "", gradient: "from-blue-500 to-indigo-600", featured: false },
  { id: "3", title: "Creative Flyer", category: "Graphic Design", description: "", imageUrl: "", link: "", gradient: "from-emerald-400 to-cyan-500", featured: false },
  { id: "4", title: "Logo Design", category: "Branding", description: "", imageUrl: "", link: "", gradient: "from-purple-500 to-fuchsia-600", featured: false },
  { id: "5", title: "Social Media Post", category: "Marketing", description: "", imageUrl: "", link: "", gradient: "from-pink-500 to-rose-500", featured: false },
  { id: "6", title: "T-Shirt Design", category: "Merchandise", description: "", imageUrl: "", link: "", gradient: "from-amber-400 to-orange-500", featured: false },
];

export default function Portfolio() {
  const { data: projects = FALLBACK } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiFetch<Project[]>("/projects"),
    placeholderData: FALLBACK,
  });

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            My <span className="text-gradient">Portfolio</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A selection of recent design projects demonstrating expertise in branding, UI/UX, and graphic layouts.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((item, i) => (
            <FadeIn key={item.id} delay={(i % 3 + 1) * 100}>
              <div
                className="
                  group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer
                  shadow-lg hover:shadow-2xl
                  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  hover:-translate-y-2
                  border border-white/10
                "
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} group-hover:scale-110 transition-transform duration-700 ease-out`} />
                )}

                <div
                  className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                />

                {item.featured && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 text-xs font-bold bg-white/20 backdrop-blur-md text-white rounded-full border border-white/30">
                      Featured
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-7 z-10">
                  <div className="translate-y-5 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-white/70 font-medium text-xs uppercase tracking-widest mb-1.5 block">{item.category}</span>
                    <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{item.title}</h3>
                    {item.description && <p className="text-white/70 text-sm mb-4 line-clamp-2">{item.description}</p>}
                    <div className="flex gap-3">
                      <button aria-label="View full size" className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-200">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label="Open link" className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-200">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
                  <span className="px-3 py-1 text-[11px] font-semibold bg-black/20 backdrop-blur-sm text-white/80 rounded-full uppercase tracking-widest">{item.category}</span>
                  <h3 className="text-2xl font-display font-bold text-white drop-shadow-md text-center px-6">{item.title}</h3>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={300} className="mt-16 text-center">
          <button className="btn-shine px-8 py-4 rounded-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 mx-auto group">
            View More Projects
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}
