import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaCode, FaUser, FaHome, FaBook } from 'react-icons/fa';
import { useBlog } from '@/hooks/use-blog';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { posts, loadPosts } = useBlog();
  const location = useLocation();

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
    updateTime();
    loadPosts();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, [loadPosts]);

  const publishedPostsCount = posts.filter(post => post.status === 'published').length;

  const navItems = [
    { name: 'HOME', icon: <FaHome className="mr-1" />, href: '/', isScroll: false },
    { name: 'ABOUT', icon: <FaUser className="mr-1" />, href: '#about', isScroll: true },
    { name: 'EXPERIENCE', icon: <FaBook className="mr-1" />, href: '#experience', isScroll: true },
    { name: 'PROJECTS', icon: <FaCode className="mr-1" />, href: '#projects', isScroll: true },
    { 
      name: 'BLOG', 
      icon: <FaBook className="mr-1" />,
      badge: publishedPostsCount > 0 ? publishedPostsCount : null,
      href: '/blog',
      isScroll: false
    },
    { name: 'CONTACT', icon: <FaEnvelope className="mr-1" />, href: '#contact', isScroll: true },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

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
            <span className="neon-text-green" data-text="PORT">PORT</span>
            <span className="neon-text-red" data-text="FOLIO">FOLIO</span>
          </div>
          
          <div className="hidden md:flex ml-4 bg-muted px-2 py-1 rounded font-mono text-xs render-optimize">
            <span className="text-primary mr-1">[DEV]</span>
            <span className="text-secondary">{timeString}</span>
          </div>
        </motion.div>
        
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item, index) => {
            const isActive = item.isScroll 
              ? location.pathname === '/' && location.hash === item.href
              : location.pathname === item.href;
            
            if (item.isScroll) {
              return (
                <motion.a
                  key={index}
                  href={item.href}
                  className={`px-3 py-2 font-hacker text-sm font-medium hover:text-primary flex items-center relative overflow-hidden group ${isActive ? 'text-primary' : ''}`}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="relative z-10 flex items-center">
                    {item.icon}
                    {item.name}
                    {item.badge && (
                      <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <motion.span 
                    className="absolute inset-0 bg-muted z-0"
                    initial={{ height: 0 }}
                    whileHover={{ height: '100%' }}
                    transition={{ duration: 0.1 }}
                  />
                </motion.a>
              );
            } else {
              return (
                <motion.div key={index} whileHover={{ scale: 1.05 }}>
                  <Link
                    to={item.href}
                    className={`px-3 py-2 font-hacker text-sm font-medium hover:text-primary flex items-center relative overflow-hidden group ${isActive ? 'text-primary' : ''}`}
                  >
                    <span className="relative z-10 flex items-center">
                      {item.icon}
                      {item.name}
                      {item.badge && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <motion.span 
                      className="absolute inset-0 bg-muted z-0"
                      initial={{ height: 0 }}
                      whileHover={{ height: '100%' }}
                      transition={{ duration: 0.1 }}
                    />
                  </Link>
                </motion.div>
              );
            }
          })}
        </nav>
        
        <button
          className="md:hidden text-primary focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            className="md:hidden bg-background/95 backdrop-blur-md mt-2 px-4 py-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item, index) => {
                const isActive = item.isScroll 
                  ? location.pathname === '/' && location.hash === item.href
                  : location.pathname === item.href;
                
                if (item.isScroll) {
                  return (
                    <a
                      key={index}
                      href={item.href}
                      className={`px-3 py-2 font-hacker text-sm font-medium hover:text-primary flex items-center ${isActive ? 'text-primary' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                      {item.badge && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                } else {
                  return (
                    <Link
                      key={index}
                      to={item.href}
                      className={`px-3 py-2 font-hacker text-sm font-medium hover:text-primary flex items-center ${isActive ? 'text-primary' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                      {item.badge && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      
      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mt-2"></div>
    </motion.header>
  );
};

export default Navbar;