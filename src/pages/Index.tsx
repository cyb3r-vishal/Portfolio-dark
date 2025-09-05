import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Contact from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground noise-bg">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      
      <footer className="py-8 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 font-cyber text-sm">
            <span className="text-primary">&copy; {new Date().getFullYear()}</span> | Cybersecurity Portfolio
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Designed and developed with advanced security protocols.
          </p>
        </div>
      </footer>
    </div>
  );
}