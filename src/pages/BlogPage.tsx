import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlog, BlogPost } from "@/hooks/use-blog";
import { Calendar, Clock, ArrowRight, Search, Tag, BookOpen } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/layout/Navbar";

export default function BlogPage() {
  const { posts, loading, loadPosts } = useBlog();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    let filtered = posts.filter(post => post.status === 'published');

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    // Sort by published date, newest first
    filtered.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at);
      const dateB = new Date(b.published_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedTag]);

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Get all unique tags from published posts
  const allTags = Array.from(
    new Set(
      posts
        .filter(post => post.status === 'published')
        .flatMap(post => post.tags)
    )
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-cyber mb-4">
            <span className="neon-text-green">CYBER</span>
            <span className="neon-text-red">BLOG</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and discoveries in cybersecurity, ethical hacking, and technology
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedTag && (
              <Button
                variant="outline"
                onClick={() => setSelectedTag(null)}
                className="whitespace-nowrap"
              >
                Clear Filter: {selectedTag}
              </Button>
            )}
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground mr-2">Filter by tag:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Blog Posts */}
        {filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || selectedTag ? "No posts found" : "No blog posts yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedTag 
                  ? "Try adjusting your search or filter criteria"
                  : "Check back soon for cybersecurity insights and tutorials"
                }
              </p>
              {(searchTerm || selectedTag) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTag(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm cursor-pointer"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {post.featured_image && (
                      <div className="w-full md:w-64 aspect-video md:aspect-square overflow-hidden rounded-lg flex-shrink-0">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(post.published_at || post.created_at), "MMM d, yyyy")}
                        <Clock className="h-4 w-4 ml-2" />
                        {getReadingTime(post.content)} min read
                      </div>
                      
                      <div>
                        <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-3">
                          {post.title}
                        </CardTitle>
                        
                        {post.excerpt && (
                          <CardDescription className="text-base line-clamp-3 mb-4">
                            {post.excerpt}
                          </CardDescription>
                        )}
                        
                        <div className="text-muted-foreground mb-4">
                          {post.content.substring(0, 200)}...
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 4).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{post.tags.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Showing {filteredPosts.length} of {posts.filter(p => p.status === 'published').length} published posts
          </div>
        )}
      </main>
    </div>
  );
}