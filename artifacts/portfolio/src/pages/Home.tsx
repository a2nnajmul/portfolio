import { Suspense, lazy } from "react";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

// Lazy load heavier sections for performance
const About = lazy(() => import("@/components/sections/About"));
const Skills = lazy(() => import("@/components/sections/Skills"));
const Experience = lazy(() => import("@/components/sections/Experience"));
const Portfolio = lazy(() => import("@/components/sections/Portfolio"));

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Preloader />
      <Navbar />

      {/* Eagerly loaded for fast LCP */}
      <Hero />

      {/* Lazy loaded visual sections */}
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

      {/* Eagerly loaded: critical for user interaction */}
      <Contact />
      <Footer />
    </main>
  );
}
