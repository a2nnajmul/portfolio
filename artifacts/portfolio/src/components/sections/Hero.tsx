import { Facebook, Twitter, Instagram, Mail, ArrowRight, Download } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/a2nnajmul", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/a2nnajmul", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/a2nnajmul", label: "Instagram" },
  { icon: Mail, href: "mailto:a2nnajmul@gmail.com", label: "Email" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="animate-blob-drift absolute -top-32 right-0 h-[700px] w-[700px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="animate-blob-drift-reverse absolute -bottom-24 -left-24 h-[500px] w-[500px] rounded-full bg-primary/6 blur-[100px]" />
        <div className="animate-blob-drift-slow absolute top-1/3 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-[#ea580c]/6 blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-5rem)]">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1 text-center lg:text-left py-8 lg:py-16"
          >
            {/* Availability badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span>Available for new projects</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-xl md:text-2xl font-medium text-muted-foreground mb-2"
            >
              Hi, I'm
            </motion.h2>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight mb-4 text-foreground"
            >
              Najmul Alam
            </motion.h1>

            <motion.h3
              variants={itemVariants}
              className="text-2xl md:text-3xl font-display font-bold text-gradient mb-6"
            >
              Student &amp; Graphic Designer
            </motion.h3>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Creative Graphic Designer passionate about logo design, UI/UX, and crafting memorable brand identities.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12"
            >
              <a
                href={`${import.meta.env.BASE_URL}Najmul_Alam_CV.pdf`}
                download
                className="btn-shine animate-glow-pulse w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-[#ea580c] text-white shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 hover:-translate-y-1.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Download CV
                <Download className="w-5 h-5 group-hover:animate-bounce" />
              </a>
              <button
                onClick={() =>
                  document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-background border-2 border-border text-foreground hover:bg-secondary/60 hover:border-primary/40 hover:-translate-y-1.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
              >
                View Work
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              <span className="text-sm font-medium text-muted-foreground mr-1">Follow Me:</span>
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary shadow-sm hover:shadow-md transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
            className="order-1 lg:order-2 relative mx-auto w-full max-w-[440px] lg:max-w-[500px]"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-primary/25 to-[#ea580c]/20 blur-2xl opacity-80 -z-10"
            />

            <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-[2rem] border-[6px] border-background shadow-2xl bg-card">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 z-10 pointer-events-none" />
              <picture className="absolute inset-0 w-full h-full">
                <source
                  srcSet={`${import.meta.env.BASE_URL}profile-banner.webp`}
                  type="image/webp"
                />
                <img
                  src={`${import.meta.env.BASE_URL}profile-banner.jpg`}
                  alt="Najmul Alam — Graphic Designer"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "85% top" }}
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>

            <div
              aria-hidden="true"
              className="animate-float absolute -bottom-6 -left-8 w-44 h-44 bg-card rounded-3xl border border-border/60 -z-20 shadow-xl hidden sm:block"
              style={{ animationDelay: "0s" }}
            />
            <div
              aria-hidden="true"
              className="animate-float absolute top-10 -right-8 w-20 h-20 rounded-full border-[7px] border-primary/25 -z-20 hidden sm:block"
              style={{ animationDelay: "1.5s" }}
            />
            <div
              aria-hidden="true"
              className="absolute bottom-10 -right-4 w-5 h-5 rounded-full bg-primary/60 blur-sm hidden lg:block"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
