import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlog, BlogPost } from "@/hooks/use-blog";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function Blog() {
  const navigate = useNavigate();
  const { posts, loading, loadPosts } = useBlog();
  const [displayPosts, setDisplayPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadPosts(false); // Load only published posts for public view
  }, [loadPosts]);

  useEffect(() => {
    // Show only the latest 3 published posts
    setDisplayPosts(posts.filter(post => post.status === 'published').slice(0, 3));
  }, [posts]);

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  if (loading) {
    return (
      <section id="blog" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cyber">
              <span className="text-primary">Latest</span> Blog Posts
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Insights on cybersecurity, ethical hacking, and technology trends
            </p>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (displayPosts.length === 0) {
    return (
      <section id="blog" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cyber">
              <span className="text-primary">Latest</span> Blog Posts
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Insights on cybersecurity, ethical hacking, and technology trends
            </p>
          </div>
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No blog posts available yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Check back soon for cybersecurity insights and tutorials!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cyber">
            <span className="text-primary">Latest</span> Blog Posts
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Insights on cybersecurity, ethical hacking, and technology trends
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayPosts.map((post) => (
            <Card 
              key={post.id} 
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm cursor-pointer"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              {post.featured_image && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.published_at || post.created_at), "MMM d, yyyy")}
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  {getReadingTime(post.content)} min read
                </div>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                {post.excerpt && (
                  <CardDescription className="line-clamp-2">
                    {post.excerpt}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {!post.excerpt && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {truncateContent(post.content.replace(/[#*`]/g, ''))}
                  </p>
                )}
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="group/btn p-0 h-auto font-medium text-primary hover:text-primary/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/blog/${post.slug}`);
                  }}
                >
                  Read More
                  <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {posts.filter(post => post.status === 'published').length > 3 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="group"
              onClick={() => navigate('/blog')}
            >
              View All Posts
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}