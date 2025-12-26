import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FaServer, FaShieldAlt, FaCode, FaBug } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useProfile } from '@/hooks/use-profile';

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

const skillCategories = [
  {
    title: "Full Stack Development",
    icon: <FaCode className="text-primary text-xl" />,
    skills: ["React", "Node.js", "Express", "MongoDB", "Next.js", "TypeScript", "Tailwind CSS"]
  },
  {
    title: "DevOps & Cloud",
    icon: <FaServer className="text-primary text-xl" />,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Nginx", "Linux Administration"]
  },
  {
    title: "Backend & Architecture",
    icon: <FaBug className="text-primary text-xl" />,
    skills: ["REST APIs", "GraphQL", "Microservices", "Payment Gateways", "System Design", "Database Design"]
  },
  {
    title: "Security & Tools",
    icon: <FaShieldAlt className="text-primary text-xl" />,
    skills: ["Web Security", "OAuth/JWT", "Git/GitHub", "Postman", "Penetration Testing"]
  }
];

const SkillCard = ({ category, delay = 0 }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.3 });
  
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
      custom={delay}
      className="w-full md:w-1/2 lg:w-1/4 p-3"
    >
      <Card className="p-5 bg-card/50 backdrop-blur-sm border-muted h-full neon-border overflow-hidden relative">
        <div className="flex items-center mb-4">
          {category.icon}
          <h3 className="ml-3 text-lg font-cyber font-semibold">{category.title}</h3>
        </div>
        
        <div className="space-y-2">
          {category.skills.map((skill, idx) => (
            <Badge key={idx} variant="outline" className="mr-2 mb-2 bg-muted/50 font-mono">
              {skill}
            </Badge>
          ))}
        </div>
        
        {/* Cyberpunk decorative elements */}
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-secondary opacity-40"></div>
      </Card>
    </motion.div>
  );
};

const About = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.1 });
  const { profile } = useProfile();
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  return (
    <section id="about" className="py-20 relative overflow-hidden">
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
            <h2 className="font-mono text-primary text-sm uppercase tracking-wider">Professional Profile</h2>
            <div className="h-px w-12 bg-primary ml-4"></div>
          </div>
          
          <h2 className="text-4xl font-cyber font-bold mb-4">ABOUT ME</h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-muted-foreground mb-6">
              {profile.bio || (
                <>
                  Full Stack Developer with experience in building scalable web applications and cloud infrastructure.
                  Specializing in MERN stack, DevOps, and secure coding practices.
                </>
              )}
            </p>
            
            <div className="font-mono text-sm p-4 bg-muted/20 rounded-md border border-muted mb-8">
              <div className="flex mb-2">
                <span className="text-primary mr-2">&gt;</span>
                <span className="typing-effect">cat skills.txt</span>
              </div>
              <div className="pl-4">
                <p>// Founder of CampusOS (campusos.app)</p>
                <p>// Full Stack Developer with expertise in MERN stack</p>
                <p>// Experienced in building scalable cloud infrastructure</p>
                <p>// Passionate about clean code and modern web technologies</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex flex-wrap -mx-3">
          {skillCategories.map((category, index) => (
            <SkillCard key={index} category={category} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;