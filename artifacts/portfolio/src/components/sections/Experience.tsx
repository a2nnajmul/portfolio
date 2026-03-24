import { useQuery } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { Building } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Experience {
  id: string;
  company: string;
  role: string;
  year: string;
  description: string;
}

const FALLBACK: Experience[] = [
  { id: "1", company: "Facebook", role: "Ads Marketing", year: "Since 2015", description: "Specialized in social media advertising, campaign management, and content promotion targeting specific demographics to maximize engagement and ROI." },
  { id: "2", company: "YouTube", role: "Web Solution", year: "Since 2015", description: "Provided video content creation strategies and web solution consulting to optimize channel growth and digital presence." },
];

export default function Experience() {
  const { data: experiences = FALLBACK } = useQuery<Experience[]>({
    queryKey: ["experience"],
    queryFn: () => apiFetch<Experience[]>("/experience"),
    placeholderData: FALLBACK,
  });

  return (
    <section id="experience" className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Work <span className="text-gradient">Experience</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
        </FadeIn>

        <div className="relative border-l-4 border-primary/30 ml-4 md:ml-8 space-y-12 pb-8">
          {experiences.map((exp, i) => (
            <FadeIn key={exp.id} delay={(i + 1) * 100} className="relative pl-8 md:pl-12">
              <div className="absolute top-0 left-[-11px] w-5 h-5 rounded-full bg-primary border-4 border-secondary shadow-[0_0_0_4px_rgba(249,115,22,0.2)]" />
              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{exp.role}</h3>
                    <div className="flex items-center gap-2 text-lg font-medium text-foreground/80 mt-1">
                      <Building className="w-5 h-5 text-primary" />
                      {exp.company}
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm whitespace-nowrap w-max">
                    {exp.year}
                  </span>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">{exp.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
