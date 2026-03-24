import { Facebook, Twitter, Instagram, Mail, Download, ArrowRight } from "lucide-react";
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
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#f5f0eb] dark:bg-gray-900"
    >
      <div className="absolute inset-0 w-full h-full">
        <picture className="block w-full h-full">
          <source
            srcSet={`${import.meta.env.BASE_URL}profile-banner.webp`}
            type="image/webp"
          />
          <img
            src={`${import.meta.env.BASE_URL}profile-banner.jpg`}
            alt=""
            className="w-full h-full object-cover object-right md:object-center"
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-gray-900/95 dark:via-gray-900/70 dark:to-transparent md:from-white/80 md:via-white/40 md:to-transparent md:dark:from-gray-900/85 md:dark:via-gray-900/50 md:dark:to-transparent" />

        <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/40 md:hidden" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-28 md:pb-20 flex items-center min-h-screen">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-lg lg:max-w-xl"
        >
          <motion.h2
            variants={itemVariants}
            className="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-300 mb-1"
          >
            Hi, I'm
          </motion.h2>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight mb-3 text-gray-900 dark:text-white"
          >
            Najmul Alam
          </motion.h1>

          <motion.h3
            variants={itemVariants}
            className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-primary mb-8"
          >
            Student &amp; Graphic Designer
          </motion.h3>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-start gap-3 mb-8"
          >
            <a
              href={`${import.meta.env.BASE_URL}Najmul_Alam_CV.pdf`}
              download
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group"
            >
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              Download CV
            </a>
            <button
              onClick={() =>
                document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold border-2 border-gray-800/20 dark:border-white/20 text-gray-800 dark:text-white hover:border-primary hover:text-primary hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group backdrop-blur-sm"
            >
              View Work
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-9 h-9 rounded-full bg-gray-800/80 dark:bg-white/15 flex items-center justify-center text-white hover:bg-primary transition-colors duration-200"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
