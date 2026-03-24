import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { GraduationCap, Languages, Award, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type TabId = "education" | "languages" | "extra";

interface About { bio: string; }

interface EducationItem { id: string; title: string; institution: string; year: string; description: string; }
interface LanguageItem { id: string; name: string; level: string; }
interface ExtraCurricularItem { id: string; activity: string; description: string; }
interface AboutTabsContent {
  education: EducationItem[];
  languages: LanguageItem[];
  extraCurricular: ExtraCurricularItem[];
}

const FALLBACK_BIO = "I am a creative Graphic Designer and a curious student from Bangladesh. I love creating modern and clean designs, tackling challenges, and exploring new technologies. I specialize in logo design, UI/UX, and brand identity.";

const FALLBACK_TABS: AboutTabsContent = {
  education: [
    { id: "1", title: "Higher Secondary Certificate", institution: "M.A. Majid Science College", year: "2022 – 2024", description: "Field of study: Science • Dhaka, Bangladesh" },
    { id: "2", title: "Secondary School Certificate", institution: "Panchua High School", year: "2020 – 2022", description: "Field of study: Science • Dhaka, Bangladesh" },
  ],
  languages: [
    { id: "1", name: "Bengali", level: "Native" },
    { id: "2", name: "English", level: "B1/B2" },
    { id: "3", name: "Japanese", level: "B1" },
  ],
  extraCurricular: [
    { id: "1", activity: "International Scout Jamboree (2019)", description: "Bangladesh event focusing on teamwork, leadership, and cultural exchange skills." },
    { id: "2", activity: "Class Captain", description: "Led classroom initiatives and coordinated student activities effectively." },
    { id: "3", activity: "Scout Unit Leader", description: "Managed team events and guided group projects. Experienced in coordination." },
    { id: "4", activity: "Community Service", description: "Participated in road and school cleaning initiatives for hygiene awareness." },
  ],
};

const LANG_DESCRIPTIONS: Record<string, string> = {
  Native: "Mother Tongue",
  "B1/B2": "Independent User",
  B1: "Independent User",
  B2: "Upper Intermediate",
  A1: "Beginner",
  A2: "Elementary",
  C1: "Advanced",
  C2: "Proficient",
};

export default function About() {
  const [activeTab, setActiveTab] = useState<TabId>("education");

  const { data: about } = useQuery<About>({
    queryKey: ["about"],
    queryFn: () => apiFetch<About>("/about"),
    placeholderData: { bio: FALLBACK_BIO },
  });

  const { data: tabs } = useQuery<AboutTabsContent>({
    queryKey: ["content-about-tabs"],
    queryFn: () => apiFetch<AboutTabsContent>("/content/about-tabs"),
    placeholderData: FALLBACK_TABS,
  });

  const bio = about?.bio || FALLBACK_BIO;
  const t = tabs ?? FALLBACK_TABS;

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
                {t.education.map((edu) => (
                  <div key={edu.id} className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors group">
                    <div className="flex items-center gap-3 text-primary mb-4">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold tracking-wider text-sm uppercase">{edu.year}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{edu.title}</h3>
                    <p className="text-lg font-medium text-foreground/80 mb-2">{edu.institution}</p>
                    <p className="text-muted-foreground">{edu.description}</p>
                  </div>
                ))}
              </FadeIn>
            )}

            {activeTab === "languages" && (
              <FadeIn className="grid gap-6 md:grid-cols-3 animate-slide-up">
                {t.languages.map((lang) => (
                  <div key={lang.id} className="p-6 rounded-2xl bg-background border border-border flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Languages className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">{lang.name}</h3>
                    <div className="px-3 py-1 rounded-full bg-muted text-foreground text-sm font-medium mb-3">Level: {lang.level}</div>
                    <p className="text-muted-foreground">{LANG_DESCRIPTIONS[lang.level] ?? lang.level}</p>
                  </div>
                ))}
              </FadeIn>
            )}

            {activeTab === "extra" && (
              <FadeIn className="grid gap-6 md:grid-cols-2 animate-slide-up">
                {t.extraCurricular.map((item) => (
                  <div key={item.id} className="p-6 rounded-2xl bg-background border border-border flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{item.activity}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
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
