import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBlog, BlogPost } from "@/hooks/use-blog";
import { Calendar, Clock, ArrowRight, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function BlogSection() {
  const { posts, loading, loadPosts } = useBlog();
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // Get the 3 most recent published posts
    const publishedPosts = posts
      .filter(post => post.status === 'published')
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at);
        const dateB = new Date(b.published_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);
    
    setFeaturedPosts(publishedPosts);
  }, [posts]);

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Don't render the section if there are no published posts
  if (loading || featuredPosts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="py-12 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 hacker-grid opacity-10"></div>
      <div className="absolute inset-0 console-scan opacity-30"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Section Header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center gap-2 font-mono text-sm text-primary mb-2">
                <span className="inline-block w-6 h-0.5 bg-primary"></span>
                <span>&gt; BLOG.EXE</span>
                <span className="inline-block w-6 h-0.5 bg-primary"></span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-hacker font-bold">
                <span className="neon-text-green">LATEST</span>{" "}
                <span className="neon-text-red">INSIGHTS</span>
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cybersecurity tutorials, ethical hacking insights, and technology deep-dives
            </p>
          </motion.div>

          {/* Featured Posts */}
          <motion.div variants={staggerContainer} className="space-y-8">
            {featuredPosts.map((post, index) => (
              <motion.div key={post.id} variants={fadeInUp}>
                <Card className="group hover:shadow-2xl transition-all duration-500 border-border/50 hover:border-primary/30 bg-card/30 backdrop-blur-sm overflow-hidden">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="flex flex-col lg:flex-row">
                      {post.featured_image && (
                        <div className="w-full lg:w-80 h-64 lg:h-auto overflow-hidden flex-shrink-0 relative">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 lg:from-transparent lg:to-background/80"></div>
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              Featured
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 p-8 lg:p-12">
                        <div className="space-y-6">
                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(post.published_at || post.created_at), "MMM dd, yyyy")}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {getReadingTime(post.content)} min read
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Article
                            </div>
                          </div>

                          {/* Title and Content */}
                          <div>
                            <CardTitle className="text-2xl lg:text-3xl font-bold group-hover:text-primary transition-colors duration-300 mb-4 line-clamp-2">
                              {post.title}
                            </CardTitle>
                            
                            {post.excerpt && (
                              <p className="text-lg text-muted-foreground line-clamp-3 mb-6">
                                {post.excerpt}
                              </p>
                            )}
                            
                            <p className="text-muted-foreground line-clamp-2 mb-6">
                              {post.content.substring(0, 300)}...
                            </p>
                          </div>

                          {/* Tags and Read More */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {post.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge 
                                  key={tagIndex} 
                                  variant="secondary" 
                                  className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{post.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-primary font-mono text-sm group-hover:text-primary/80 transition-colors">
                              <span>READ_MORE</span>
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* View All Button */}
          <motion.div variants={fadeInUp} className="text-center mt-16">
            <Link to="/blog">
              <Button 
                size="lg" 
                className="relative group bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-background transition-all duration-300 font-mono"
              >
                <FileText className="mr-2 h-5 w-5" />
                <span>VIEW_ALL_POSTS</span>
                <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                <span className="absolute inset-0 border border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-1 translate-y-1"></span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}