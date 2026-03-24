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

function BannerPicture({ className }: { className?: string }) {
  return (
    <picture className="block w-full h-full">
      <source
        srcSet={`${import.meta.env.BASE_URL}profile-banner.webp`}
        type="image/webp"
      />
      <img
        src={`${import.meta.env.BASE_URL}profile-banner.jpg`}
        alt="Najmul Alam"
        className={className}
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );
}

function TextContent() {
  return (
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
  );
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#f5f0eb] dark:bg-gray-900 md:h-[100svh] md:min-h-[600px] md:max-h-[1000px] md:flex md:items-center"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6 md:py-0">
        <TextContent />
      </div>

      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:absolute md:inset-0 md:aspect-auto md:w-full md:h-full overflow-hidden">
        <BannerPicture className="w-full h-full object-cover object-[75%_center] md:object-[right_center]" />

        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#f5f0eb] to-transparent dark:from-gray-900 md:hidden pointer-events-none" />

        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#f5f0eb] via-[#f5f0eb]/55 to-transparent dark:from-gray-900 dark:via-gray-900/55 dark:to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
