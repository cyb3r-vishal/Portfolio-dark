import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlog } from "@/hooks/use-blog";
import { FileText, Eye, Calendar, TrendingUp } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BlogStats() {
  const { posts, loadPosts, loading } = useBlog();
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all posts including drafts when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadPosts(true); // true = include unpublished posts
        setIsLoaded(true);
      } catch (error) {
        console.error("BlogStats: Error loading posts", error);
        toast.error("Failed to load blog statistics");
      }
    };
    
    loadData();
  }, [loadPosts]);
  
  // Log when posts change
  useEffect(() => {
    console.log("BlogStats: Posts updated", posts.length);
    
    // Check local storage directly
    const localPosts = localStorage.getItem('local_blog_posts');
    if (localPosts) {
      try {
        const parsed = JSON.parse(localPosts);
        console.log("BlogStats: Direct localStorage check found", parsed.length, "posts");
      } catch (error) {
        console.error("BlogStats: Error parsing local storage posts", error);
      }
    } else {
      console.log("BlogStats: No posts found in localStorage");
    }
  }, [posts]);

  const publishedPosts = posts.filter(post => post.status === 'published');
  const draftPosts = posts.filter(post => post.status === 'draft');
  
  // Posts published in the last 7 days
  const recentPosts = publishedPosts.filter(post => 
    post.published_at && isAfter(new Date(post.published_at), subDays(new Date(), 7))
  );

  // Most used tags
  const tagCounts = posts.reduce((acc, post) => {
    post.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const stats = [
    {
      title: "Total Posts",
      value: posts.length,
      description: "All blog posts",
      icon: <FileText className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      title: "Published",
      value: publishedPosts.length,
      description: "Live on portfolio",
      icon: <Eye className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      title: "Drafts",
      value: draftPosts.length,
      description: "Work in progress",
      icon: <Calendar className="h-4 w-4" />,
      color: "text-yellow-600"
    },
    {
      title: "This Week",
      value: recentPosts.length,
      description: "Published recently",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Blog Statistics</h3>
        
        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading blog statistics...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={stat.color}>
                        {stat.icon}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {!loading && (
          <>
            {/* Top Tags */}
            {topTags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Popular Tags</CardTitle>
                  <CardDescription>Most frequently used tags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topTags.map(([tag, count]) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag} ({count})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {recentPosts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Publications</CardTitle>
                  <CardDescription>Posts published in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className="flex gap-4 py-2 border-b border-border/50 last:border-0">
                        {post.featured_image && (
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{post.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.published_at && format(new Date(post.published_at), 'MMM d, yyyy')}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}