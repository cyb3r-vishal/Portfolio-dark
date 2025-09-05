import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaLock, FaShieldAlt, FaBug, FaCode } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

// Sample project data - would be fetched from an API in a real implementation
const projectsData = [
  {
    id: 1,
    title: "Vulnerability Scanner",
    description: "An advanced scanner that detects security vulnerabilities in web applications and networks.",
    image: "vulnerability-scanner.jpg", // Would be in public/assets/
    tags: ["Python", "Security", "Automation"],
    links: {
      github: "#",
      live: "#"
    },
    icon: <FaBug />
  },
  {
    id: 2,
    title: "Intrusion Detection System",
    description: "A machine learning-based system that monitors network traffic to identify unauthorized access attempts.",
    image: "ids-system.jpg",
    tags: ["Python", "Machine Learning", "Network Security"],
    links: {
      github: "#",
      live: "#"
    },
    icon: <FaShieldAlt />
  },
  {
    id: 3,
    title: "Security Dashboard",
    description: "Interactive dashboard for monitoring and visualizing security metrics and incidents in real-time.",
    image: "/images/Dashboard.jpg",
    tags: ["React", "D3.js", "API Integration"],
    links: {
      github: "#",
      live: "#"
    },
    icon: <FaCode />
  },
  {
    id: 4,
    title: "Encryption Tool",
    description: "End-to-end encryption tool for secure file transfer and communication between parties.",
    image: "encryption-tool.jpg",
    tags: ["Cryptography", "C++", "Security"],
    links: {
      github: "#",
      live: "#"
    },
    icon: <FaLock />
  }
];

const ProjectCard = ({ project, index }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.2 });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeIn}
      custom={index * 0.1}
      className="w-full md:w-1/2 lg:w-1/2 p-4"
    >
      <Card className="overflow-hidden h-full bg-card/50 backdrop-blur-sm border-muted hover:border-primary transition-colors duration-300">
        <div className="relative overflow-hidden aspect-video">
          {/* Project image placeholder with cyberpunk styling */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 cyber-grid flex items-center justify-center">
            <div className="text-4xl text-primary/70">
              {project.icon}
            </div>
          </div>
          
          {/* Overlay info */}
          <div className="absolute inset-0 bg-background/80 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="font-mono text-sm text-primary">&gt; PROJECT_DETAILS</div>
              <p className="text-sm mt-2">{project.description}</p>
            </div>
          </div>
        </div>
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className="font-cyber font-semibold text-lg">{project.title}</h3>
            <div className="flex space-x-2">
              <a href={project.links.github} className="text-muted-foreground hover:text-primary transition-colors">
                <FaGithub />
              </a>
              <a href={project.links.live} className="text-muted-foreground hover:text-primary transition-colors">
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="font-mono text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button variant="ghost" size="sm" className="font-mono text-xs w-full group">
            <span className="mr-2">VIEW PROJECT</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">_</span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Projects = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  return (
    <section id="projects" className="py-20 relative overflow-hidden bg-muted/20">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={fadeIn}
          className="mb-12 text-center"
        >
          <div className="flex justify-center items-center mb-2">
            <div className="h-px w-12 bg-primary mr-4"></div>
            <h2 className="font-mono text-primary text-sm uppercase tracking-wider">Secure Assets</h2>
            <div className="h-px w-12 bg-primary ml-4"></div>
          </div>
          
          <h2 className="text-4xl font-cyber font-bold mb-4">PROJECTS</h2>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-8">
              A curated showcase of my security projects, tools, and research. Each project demonstrates 
              different aspects of cybersecurity expertise and technical skills.
            </p>
          </div>
        </motion.div>
        
        <div className="flex flex-wrap -mx-4">
          {projectsData.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;