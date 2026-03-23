import { Facebook, Twitter, Instagram, Mail, ArrowRight, Download } from "lucide-react";
import { motion } from "framer-motion";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/a2nnajmul", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/a2nnajmul", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/a2nnajmul", label: "Instagram" },
  { icon: Mail, href: "mailto:a2nnajmul@gmail.com", label: "Email" },
];

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Available for new projects</span>
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-medium text-muted-foreground mb-2">
              Hi, I'm
            </motion.h2>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-4 text-foreground">
              Najmul Alam
            </motion.h1>
            
            <motion.h3 variants={itemVariants} className="text-2xl md:text-3xl font-display font-bold text-gradient mb-6">
              Student & Graphic Designer
            </motion.h3>
            
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Creative Graphic Designer passionate about logo design, UI/UX, and crafting memorable brand identities.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
              <a 
                href={`${import.meta.env.BASE_URL}Najmul_Alam_CV.pdf`} 
                download
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-[#ea580c] text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Download CV
                <Download className="w-5 h-5 group-hover:animate-bounce" />
              </a>
              
              <button 
                onClick={() => {
                  document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-background border-2 border-border text-foreground hover:bg-muted hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                View Work
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-4">
              <span className="text-sm font-medium text-muted-foreground mr-2">Follow Me:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary hover:-translate-y-1 transition-all duration-300 shadow-sm"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2 relative mx-auto w-full max-w-[480px]"
          >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border-8 border-background shadow-2xl z-10 bg-card">
              {/* Fallback pattern while image loads, though eager load is preferred */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
              <img 
                src={`${import.meta.env.BASE_URL}profile-banner.jpg`} 
                alt="Najmul Alam"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "75% center" }}
              />
            </div>
            
            {/* Decorative background blocks behind image */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-[#ea580c] rounded-[2.5rem] opacity-20 blur-2xl -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-card rounded-3xl border border-border/50 -z-20 shadow-xl hidden md:block"></div>
            <div className="absolute top-12 -right-8 w-24 h-24 rounded-full border-[8px] border-primary/20 -z-20 hidden md:block"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
