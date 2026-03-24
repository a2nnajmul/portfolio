import { FadeIn } from "@/components/FadeIn";
import { Palette, Layout, PenTool, Image as ImageIcon } from "lucide-react";

const coreSkills = [
  {
    title: "Graphic Design",
    icon: Palette,
    desc: "Visual concepts and creative layouts",
    color: "from-orange-400/20 to-rose-400/10",
    iconBg: "bg-orange-50 dark:bg-orange-950/40",
    iconColor: "text-orange-500",
  },
  {
    title: "UI/UX Design",
    icon: Layout,
    desc: "User-centric modern interfaces",
    color: "from-blue-400/20 to-indigo-400/10",
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-500",
  },
  {
    title: "Adobe Illustrator",
    icon: PenTool,
    desc: "Vector graphics and illustrations",
    color: "from-emerald-400/20 to-teal-400/10",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-500",
  },
  {
    title: "Adobe Photoshop",
    icon: ImageIcon,
    desc: "Photo editing and compositions",
    color: "from-purple-400/20 to-fuchsia-400/10",
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    iconColor: "text-purple-500",
  },
];

const secondarySkills = [
  "Windows OS",
  "Microsoft Word",
  "Microsoft Excel",
  "PowerPoint",
  "Canva",
  "English Typing",
  "Bangla Typing",
  "Japanese Typing",
];

export default function Skills() {
  return (
    <section id="skills" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            My <span className="text-gradient">Skills</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A blend of creative design expertise and technical proficiency.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {coreSkills.map((skill, i) => (
            <FadeIn key={skill.title} delay={(i + 1) * 100} className="h-full">
              <div
                className={`
                  group h-full bg-card rounded-3xl p-8 border border-border
                  shadow-sm hover:shadow-2xl hover:border-primary/30
                  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  hover:-translate-y-2
                  relative overflow-hidden flex flex-col items-center text-center
                `}
              >
                {/* Gradient wash on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                />

                {/* Icon */}
                <div
                  className={`relative z-10 w-20 h-20 rounded-2xl ${skill.iconBg} ${skill.iconColor} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  <skill.icon className="w-10 h-10" strokeWidth={1.5} />
                </div>

                <h3 className="relative z-10 text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                  {skill.title}
                </h3>
                <p className="relative z-10 text-muted-foreground leading-relaxed text-sm">
                  {skill.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn
          delay={300}
          className="max-w-4xl mx-auto bg-secondary/30 rounded-3xl p-8 md:p-10 border border-border text-center hover:border-primary/20 hover:shadow-lg transition-all duration-300"
        >
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Technical &amp; Office Skills
          </h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {secondarySkills.map((skill) => (
              <span
                key={skill}
                className="px-5 py-2.5 rounded-full bg-background border border-border text-foreground font-medium shadow-sm hover:border-primary hover:text-primary hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-default"
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
