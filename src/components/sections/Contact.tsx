import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FaTwitter, FaGithub, FaLinkedin, FaEnvelope, FaLock, FaPhone, FaGlobe } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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

// Mock function to simulate social media integration
const fetchSocialStats = () => {
  // In a real implementation, this would call APIs for each platform
  return {
    twitter: {
      followers: 1200,
      posts: 450
    },
    github: {
      repos: 35,
      stars: 128
    },
    linkedin: {
      connections: 500,
      endorsements: 48
    }
  };
};

const Contact = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [socialStats, setSocialStats] = useState(null);
  const { profile } = useProfile();
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
    
    // Fetch social media stats - simulated here
    setSocialStats(fetchSocialStats());
  }, [controls, inView]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log({ name, email, message });
    
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    
    // Show success (would be implemented with a proper toast notification)
    alert('Message sent successfully!');
  };
  
  return (
    <section id="contact" className="py-16 relative overflow-hidden">
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
            <h2 className="font-mono text-primary text-sm uppercase tracking-wider">Secure Channel</h2>
            <div className="h-px w-12 bg-primary ml-4"></div>
          </div>
          
          <h2 className="text-4xl font-cyber font-bold mb-4">CONTACT ME</h2>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-8">
              Interested in collaborating on a security project or need consulting services? 
              Send me an encrypted message through this secure form or connect via social platforms.
            </p>
          </div>
        </motion.div>
        
        <div className="flex flex-wrap -mx-4">
          {/* Contact Form */}
          <div className="w-full lg:w-1/2 px-4 mb-8 lg:mb-0">
            <motion.div
              initial="hidden"
              animate={controls}
              variants={fadeIn}
              custom={0.2}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-muted overflow-hidden relative p-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <div className="font-mono text-xs flex items-center mb-1">
                        <FaLock className="text-primary mr-2" />
                        <span>ENCRYPTED_NAME</span>
                      </div>
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-muted/50 border-muted focus:border-primary"
                        placeholder="Enter your name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-mono text-xs flex items-center mb-1">
                        <FaLock className="text-primary mr-2" />
                        <span>ENCRYPTED_EMAIL</span>
                      </div>
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-muted/50 border-muted focus:border-primary"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-mono text-xs flex items-center mb-1">
                        <FaLock className="text-primary mr-2" />
                        <span>ENCRYPTED_MESSAGE</span>
                      </div>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="bg-muted/50 border-muted focus:border-primary min-h-[150px]"
                        placeholder="Enter your message"
                      />
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full relative group">
                      <span>SEND_SECURE_MESSAGE</span>
                      <span className="absolute inset-0 border border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Social Links & Stats */}
          <div className="w-full lg:w-1/2 px-4">
            <motion.div
              initial="hidden"
              animate={controls}
              variants={fadeIn}
              custom={0.4}
              className="space-y-4"
            >
              {/* Social links with cyberpunk styling */}
              <Card className="bg-card/50 backdrop-blur-sm border-muted overflow-hidden relative">
                <CardContent className="p-6">
                  <h3 className="font-cyber font-bold text-xl mb-4">SOCIAL_NETWORKS</h3>
                  
                  <div className="space-y-5">
                    {socialStats && (
                      <>
                        <a href={profile.twitter || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-muted rounded-md hover:border-primary transition-colors group">
                          <div className="flex items-center">
                            <div className="p-2 bg-muted rounded-md group-hover:bg-primary/20 transition-colors">
                              <FaTwitter className="text-primary" />
                            </div>
                            <span className="ml-3 font-mono">Twitter</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {socialStats && (
                              <>
                                <span className="mr-3">{socialStats.twitter.followers} followers</span>
                                <span>{socialStats.twitter.posts} posts</span>
                              </>
                            )}
                          </div>
                        </a>
                        
                        <a href={profile.github || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-muted rounded-md hover:border-primary transition-colors group">
                          <div className="flex items-center">
                            <div className="p-2 bg-muted rounded-md group-hover:bg-primary/20 transition-colors">
                              <FaGithub className="text-primary" />
                            </div>
                            <span className="ml-3 font-mono">GitHub</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {socialStats && (
                              <>
                                <span className="mr-3">{socialStats.github.repos} repos</span>
                                <span>{socialStats.github.stars} stars</span>
                              </>
                            )}
                          </div>
                        </a>
                        
                        <a href={profile.linkedin || '#'} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border border-muted rounded-md hover:border-primary transition-colors group">
                          <div className="flex items-center">
                            <div className="p-2 bg-muted rounded-md group-hover:bg-primary/20 transition-colors">
                              <FaLinkedin className="text-primary" />
                            </div>
                            <span className="ml-3 font-mono">LinkedIn</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {socialStats && (
                              <>
                                <span className="mr-3">{socialStats.linkedin.connections} connections</span>
                                <span>{socialStats.linkedin.endorsements} endorsements</span>
                              </>
                            )}
                          </div>
                        </a>
                      </>
                    )}
                    
                    <a href={`mailto:${profile.email || 'contact@example.com'}`} className="flex items-center justify-between p-3 border border-muted rounded-md hover:border-primary transition-colors group">
                      <div className="flex items-center">
                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary/20 transition-colors">
                          <FaEnvelope className="text-primary" />
                        </div>
                        <span className="ml-3 font-mono">Email</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span>{profile.email || 'contact@example.com'}</span>
                      </div>
                    </a>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;