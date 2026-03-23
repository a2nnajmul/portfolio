import { FadeIn } from "@/components/FadeIn";
import { Palette, Layout, PenTool, Image as ImageIcon, Code, Monitor, PenLine, FileText } from "lucide-react";

const coreSkills = [
  { title: "Graphic Design", icon: Palette, desc: "Visual concepts and creative layouts" },
  { title: "UI/UX Design", icon: Layout, desc: "User-centric modern interfaces" },
  { title: "Adobe Illustrator", icon: PenTool, desc: "Vector graphics and illustrations" },
  { title: "Adobe Photoshop", icon: ImageIcon, desc: "Photo editing and compositions" },
];

const secondarySkills = [
  "Windows OS", "Microsoft Word", "Microsoft Excel", "PowerPoint", 
  "Canva", "English Typing", "Bangla Typing", "Japanese Typing"
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            My <span className="text-gradient">Skills</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {coreSkills.map((skill, i) => (
            <FadeIn key={skill.title} delay={((i + 1) * 100) as any} className="h-full">
              <div className="group h-full bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center">
                {/* Hover Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-20 h-20 rounded-2xl bg-secondary text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <skill.icon className="w-10 h-10" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 relative z-10 group-hover:text-primary transition-colors">{skill.title}</h3>
                <p className="text-muted-foreground relative z-10">{skill.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={300} className="max-w-4xl mx-auto bg-secondary/30 rounded-3xl p-8 md:p-10 border border-border text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">Technical & Office Skills</h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {secondarySkills.map((skill) => (
              <span 
                key={skill} 
                className="px-5 py-2.5 rounded-full bg-background border border-border text-foreground font-medium shadow-sm hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all duration-300 cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
