import SceneStage from "@/components/3d/SceneStage";
import ScrollAnimations from "@/components/animations/ScrollAnimations";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Work from "@/components/sections/Work";
import Research from "@/components/sections/Research";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <main id="main" className="relative">
        <SceneStage />
        <Hero />
        <About />
        <Work />
        <Research />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <ScrollAnimations />
    </>
  );
}
