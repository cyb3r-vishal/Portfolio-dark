import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlog } from "@/hooks/use-blog";
import { FileText, Eye, Calendar, TrendingUp } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

export default function BlogStats() {
  const { posts } = useBlog();

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
              <div className="space-y-2">
                {recentPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {post.published_at && format(new Date(post.published_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {post.tags.length} tags
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}