import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { GraduationCap, Languages, Award, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type TabId = "education" | "languages" | "extra";

interface About { bio: string; }

const FALLBACK_BIO = "I am a creative Graphic Designer and a curious student from Bangladesh. I love creating modern and clean designs, tackling challenges, and exploring new technologies. I specialize in logo design, UI/UX, and brand identity.";

export default function About() {
  const [activeTab, setActiveTab] = useState<TabId>("education");

  const { data: about } = useQuery<About>({
    queryKey: ["about"],
    queryFn: () => apiFetch<About>("/about"),
    placeholderData: { bio: FALLBACK_BIO },
  });

  const bio = about?.bio || FALLBACK_BIO;

  return (
    <section id="about" className="py-16 md:py-24 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            About <span className="text-gradient">Me</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed">{bio}</p>
        </FadeIn>

        <div className="mt-12 bg-card rounded-3xl p-6 md:p-10 shadow-xl border border-border">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
            {[
              { id: "education", label: "Education & Training", icon: GraduationCap },
              { id: "languages", label: "Languages", icon: Languages },
              { id: "extra", label: "Extra-Curricular", icon: Award },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-background hover:bg-muted text-foreground border border-border"
                )}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[250px] md:min-h-[300px]">
            {activeTab === "education" && (
              <FadeIn className="grid gap-6 md:grid-cols-2 animate-slide-up">
                <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3 text-primary mb-4">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold tracking-wider text-sm uppercase">2022 – 2024</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Higher Secondary Certificate</h3>
                  <p className="text-lg font-medium text-foreground/80 mb-2">M.A. Majid Science College</p>
                  <p className="text-muted-foreground">Field of study: Science • Dhaka, Bangladesh</p>
                </div>
                <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors group">
                  <div className="flex items-center gap-3 text-primary mb-4">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold tracking-wider text-sm uppercase">2020 – 2022</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Secondary School Certificate</h3>
                  <p className="text-lg font-medium text-foreground/80 mb-2">Panchua High School</p>
                  <p className="text-muted-foreground">Field of study: Science • Dhaka, Bangladesh</p>
                </div>
              </FadeIn>
            )}

            {activeTab === "languages" && (
              <FadeIn className="grid gap-6 md:grid-cols-3 animate-slide-up">
                {[
                  { lang: "Bengali", level: "Native", desc: "Mother Tongue" },
                  { lang: "English", level: "B1/B2", desc: "Independent User" },
                  { lang: "Japanese", level: "B1", desc: "Independent User" },
                ].map((lang) => (
                  <div key={lang.lang} className="p-6 rounded-2xl bg-background border border-border flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Languages className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">{lang.lang}</h3>
                    <div className="px-3 py-1 rounded-full bg-muted text-foreground text-sm font-medium mb-3">Level: {lang.level}</div>
                    <p className="text-muted-foreground">{lang.desc}</p>
                  </div>
                ))}
              </FadeIn>
            )}

            {activeTab === "extra" && (
              <FadeIn className="grid gap-6 md:grid-cols-2 animate-slide-up">
                {[
                  { title: "International Scout Jamboree (2019)", desc: "Bangladesh event focusing on teamwork, leadership, and cultural exchange skills." },
                  { title: "Class Captain", desc: "Led classroom initiatives and coordinated student activities effectively." },
                  { title: "Scout Unit Leader", desc: "Managed team events and guided group projects. Experienced in coordination." },
                  { title: "Community Service", desc: "Participated in road and school cleaning initiatives for hygiene awareness." },
                ].map((item) => (
                  <div key={item.title} className="p-6 rounded-2xl bg-background border border-border flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
