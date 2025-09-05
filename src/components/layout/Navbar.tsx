import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaUnlock, FaCode, FaUserSecret, FaBug, FaTerminal } from 'react-icons/fa';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds}`);
    };

    window.addEventListener('scroll', handleScroll);
    const timer = setInterval(updateTime, 1000);
    updateTime(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const navItems = [
    { name: 'HOME', icon: <FaTerminal className="mr-1" /> },
    { name: 'ABOUT', icon: <FaCode className="mr-1" /> },
    { name: 'EXPLOITS', icon: <FaBug className="mr-1" /> },
    { name: 'CONTACT', icon: <FaLock className="mr-1" /> },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2 
      ${scrolled ? 'backdrop-blur-md bg-background/70' : 'bg-transparent'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="font-hacker text-xl font-bold relative">
            <span className="neon-text-green" data-text="BLACK">BLACK</span>
            <span className="neon-text-red" data-text="HAT">HAT</span>
          </div>
          
          <div className="hidden md:flex ml-4 bg-muted px-2 py-1 rounded font-mono text-xs render-optimize">
            <span className="text-primary mr-1">[SYS]</span>
            <span className="text-secondary">{timeString}</span>
          </div>
        </motion.div>
        
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item, index) => (
            <motion.a
              key={index}
              href={`#${item.name.toLowerCase()}`}
              className="px-3 py-2 font-hacker text-sm font-medium hover:text-primary flex items-center relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10 flex items-center">
                {item.icon}
                {item.name}
              </span>
              <motion.span 
                className="absolute inset-0 bg-muted z-0"
                initial={{ height: 0 }}
                whileHover={{ height: '100%' }}
                transition={{ duration: 0.1 }}
              />
            </motion.a>
          ))}
        </nav>
        
        <button className="md:hidden text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>
      
      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mt-2"></div>
    </motion.header>
  );
};

export default Navbar;