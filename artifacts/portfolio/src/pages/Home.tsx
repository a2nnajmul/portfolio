import { Suspense, lazy } from "react";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";

// Lazy load sections for better performance
const About = lazy(() => import("@/components/sections/About"));
const Skills = lazy(() => import("@/components/sections/Skills"));
const Experience = lazy(() => import("@/components/sections/Experience"));
const Portfolio = lazy(() => import("@/components/sections/Portfolio"));
const Contact = lazy(() => import("@/components/sections/Contact"));
const Footer = lazy(() => import("@/components/sections/Footer"));

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Preloader />
      <Navbar />
      
      {/* Eagerly loaded hero for fast LCP */}
      <Hero />
      
      {/* Lazy loaded sections wrapped in suspense */}
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <About />
        <Skills />
        <Experience />
        <Portfolio />
        <Contact />
        <Footer />
      </Suspense>
    </main>
  );
}
