import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FaTerminal, FaUserSecret } from 'react-icons/fa';
import { useProfile } from '@/hooks/use-profile';

const typewriterVariants = {
  hidden: { width: '0%' },
  visible: { 
    width: '100%', 
    transition: { 
      duration: 1.5, 
      ease: "easeInOut" 
    } 
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Binary rain background
const BinaryRainBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [raindrops, setRaindrops] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const createBinaryRain = () => {
      const newRaindrops = [];
      const columnCount = Math.floor(window.innerWidth / 20);
      
      for (let i = 0; i < 20; i++) {
        const duration = 5 + Math.random() * 10;
        const delay = Math.random() * 10;
        const column = Math.floor(Math.random() * columnCount);
        const binaryString = Math.random() > 0.5 ? '1' : '0';
        
        newRaindrops.push(
          <div 
            key={i}
            className="binary-rain render-optimize"
            style={{
              left: `${column * 20}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          >
            {binaryString}
          </div>
        );
      }
      
      setRaindrops(newRaindrops);
    };
    
    createBinaryRain();
    const resizeHandler = () => createBinaryRain();
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);
  
  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {raindrops}
    </div>
  );
};

const Hero = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [terminalText, setTerminalText] = useState('');
  const { profile } = useProfile();
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
    
    // Simulate terminal typing
    const text = "> INITIALIZING SYSTEM...\n> BYPASSING SECURITY PROTOCOLS...\n> ACCESS GRANTED";
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTerminalText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 35);
    
    return () => clearInterval(typeInterval);
  }, [controls, inView]);
  
  return (
    <section id="home" className="min-h-screen relative overflow-hidden noise-bg console-scan">
      {/* Binary Rain Background */}
      <BinaryRainBackground />
      
      {/* Background grid */}
      <div className="absolute inset-0 hacker-grid opacity-20"></div>
      
      {/* Content */}
      <div className="container mx-auto h-screen flex flex-col justify-center px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            className="mb-4 flex items-center font-mono text-sm"
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
          >
            <span className="inline-block w-6 h-0.5 bg-primary mr-2"></span>
            <span className="text-primary">&gt; ROOT@SYSTEM</span>
          </motion.div>
          
          <motion.h1 
            ref={ref}
            className="text-4xl md:text-6xl lg:text-7xl font-hacker font-bold mb-6"
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
          >
            <span className="block">
              <span className="neon-text-green">{(profile.name?.split(' ')[0] || 'BLACK').toUpperCase()}</span>
              <span className="neon-text-red">{(profile.name?.split(' ')[1] || 'HAT').toUpperCase()}</span>
            </span>
            <span className="block text-2xl md:text-3xl lg:text-4xl mt-2 text-gray-300">
              {profile.headline || 'SECURITY SPECIALIST'}
            </span>
          </motion.h1>
          
          <motion.div 
            className="mb-8 font-mono text-base relative overflow-hidden bg-muted p-4 rounded-md border border-primary/30"
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
            custom={1}
          >
            <pre className="whitespace-pre-wrap text-neon-green">{terminalText}</pre>
            <span className="inline-block h-4 w-2 bg-primary animate-pulse ml-1"></span>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap gap-4"
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
            custom={2}
          >
            <Button size="lg" className="relative group bg-muted hover:bg-muted/80 border border-primary text-primary hover:text-primary">
              <FaTerminal className="mr-2" />
              <span>VIEW EXPLOITS</span>
              <span className="absolute inset-0 border border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
            
            <Button variant="outline" size="lg" className="border-muted/50 bg-transparent text-muted-foreground hover:text-foreground relative group">
              <FaUserSecret className="mr-2" />
              <span>CONTACT: SECURE CHANNEL</span>
              <span className="absolute inset-0 border border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner brackets */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-primary opacity-60"></div>
        <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-primary opacity-60"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-primary opacity-60"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-primary opacity-60"></div>
        
        {/* Scan lines */}
        <div className="absolute inset-x-0 h-px bg-primary/30 top-1/3 scan-line"></div>
        <div className="absolute inset-x-0 h-px bg-primary/30 top-2/3 scan-line" style={{ animationDelay: '2s' }}></div>
      </div>
    </section>
  );
};

export default Hero;