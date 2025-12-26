import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const experienceData = [
  {
    id: 1,
    role: "Founder & Lead Developer",
    company: "CampusOS",
    period: "2025 - Present",
    description: "Founded and developed a comprehensive campus operating system. Leading the technical strategy, full-stack development, and cloud infrastructure deployment.",
    skills: ["React", "Node.js", "AWS", "MongoDB", "Leadership"],
    type: "work"
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Freelance",
    period: "2023 - Present",
    description: "Delivered custom web solutions for various clients. Specialized in building secure, scalable applications using the MERN stack and integrating payment gateways.",
    skills: ["MERN Stack", "Payment Gateways", "Client Management"],
    type: "work"
  },
  {
    id: 3,
    role: "B.Sc. in Electronics",
    company: "University of Delhi",
    period: "2024 - 2027",
    description: "Focusing on electronics, embedded systems, and computer science fundamentals. Active member of the tech society.",
    skills: ["Electronics", "Embedded Systems", "Research"],
    type: "education"
  }
];

const ExperienceCard = ({ item, index }) => {
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
      className="mb-8 relative pl-8 border-l-2 border-muted last:mb-0"
    >
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary"></div>
      
      <div className="mb-1 flex items-center text-sm text-muted-foreground font-mono">
        <span className="mr-2">{item.period}</span>
        {item.type === 'work' ? <FaBriefcase className="text-primary" /> : <FaGraduationCap className="text-secondary" />}
      </div>
      
      <h3 className="text-xl font-bold text-foreground">{item.role}</h3>
      <h4 className="text-lg text-primary mb-2">{item.company}</h4>
      
      <p className="text-muted-foreground mb-4 max-w-2xl">
        {item.description}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {item.skills.map((skill, idx) => (
          <Badge key={idx} variant="outline" className="bg-muted/30">
            {skill}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
};

const Experience = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.1 });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  return (
    <section id="experience" className="py-20 relative bg-muted/5">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={fadeIn}
          className="mb-12 text-center"
        >
          <div className="flex justify-center items-center mb-2">
            <div className="h-px w-12 bg-primary mr-4"></div>
            <h2 className="font-mono text-primary text-sm uppercase tracking-wider">Career Path</h2>
            <div className="h-px w-12 bg-primary ml-4"></div>
          </div>
          
          <h2 className="text-4xl font-cyber font-bold mb-4">EXPERIENCE</h2>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          {experienceData.map((item, index) => (
            <ExperienceCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
