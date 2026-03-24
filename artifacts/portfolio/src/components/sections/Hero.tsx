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
    transition: { staggerChildren: 0.15, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-[100svh] min-h-[600px] max-h-[1000px] flex items-end md:items-center overflow-hidden bg-[#f5f0eb] dark:bg-gray-900"
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
            className="w-full h-full object-cover object-[70%_top] md:object-center"
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/20 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900/20 md:bg-none md:dark:bg-none" />

        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent dark:from-gray-900/90 dark:via-gray-900/60 dark:to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-20 md:pb-0 md:pt-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-lg lg:max-w-xl"
        >
          <motion.h2
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-300 mb-0.5"
          >
            Hi, I'm
          </motion.h2>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight mb-1.5 md:mb-3 text-gray-900 dark:text-white"
          >
            Najmul Alam
          </motion.h1>

          <motion.h3
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-primary mb-5 md:mb-8"
          >
            Student &amp; Graphic Designer
          </motion.h3>

          <motion.div
            variants={itemVariants}
            className="flex flex-row items-center gap-3 mb-5 md:mb-8"
          >
            <a
              href={`${import.meta.env.BASE_URL}Najmul_Alam_CV.pdf`}
              download
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
              Download CV
            </a>
            <button
              onClick={() =>
                document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-semibold border-2 border-gray-800/20 dark:border-white/20 text-gray-800 dark:text-white hover:border-primary hover:text-primary hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group backdrop-blur-sm text-sm sm:text-base"
            >
              View Work
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2.5 sm:gap-3"
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-800/80 dark:bg-white/15 flex items-center justify-center text-white hover:bg-primary transition-colors duration-200"
                aria-label={social.label}
              >
                <social.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
