import { Suspense, lazy } from "react";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Footer from "@/components/sections/Footer";

// Lazy load all content sections for code splitting
const About = lazy(() => import("@/components/sections/About"));
const Skills = lazy(() => import("@/components/sections/Skills"));
const Experience = lazy(() => import("@/components/sections/Experience"));
const Portfolio = lazy(() => import("@/components/sections/Portfolio"));
const Contact = lazy(() => import("@/components/sections/Contact"));

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Preloader />
      <Navbar />

      {/* Eagerly loaded for fast LCP */}
      <Hero />

      {/* Lazy loaded sections — each has its own Suspense boundary */}
      <Suspense fallback={<div className="py-24 bg-background" />}>
        <About />
      </Suspense>
      <Suspense fallback={<div className="py-24 bg-secondary/50" />}>
        <Skills />
      </Suspense>
      <Suspense fallback={<div className="py-24 bg-background" />}>
        <Experience />
      </Suspense>
      <Suspense fallback={<div className="py-24 bg-secondary/30" />}>
        <Portfolio />
      </Suspense>
      <Suspense fallback={<div className="py-24 bg-secondary/50" />}>
        <Contact />
      </Suspense>

      {/* Footer eagerly loaded */}
      <Footer />
    </main>
  );
}
