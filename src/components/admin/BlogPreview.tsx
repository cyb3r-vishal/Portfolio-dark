import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/hooks/use-blog";
import { processMarkdown } from "@/lib/markdown";
import { Calendar, Clock, Tag, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface BlogPreviewProps {
  post: Partial<BlogPost>;
  onClose: () => void;
}

export default function BlogPreview({ post, onClose }: BlogPreviewProps) {
  const getReadingTime = (content: string) => {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const previewPost: BlogPost = {
    id: 'preview',
    title: post.title || 'Untitled Post',
    slug: post.slug || 'untitled-post',
    content: post.content || '',
    excerpt: post.excerpt || '',
    featured_image: post.featured_image || '',
    tags: post.tags || [],
    status: post.status || 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: post.status === 'published' ? new Date().toISOString() : undefined,
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Blog Post Preview</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (previewPost.slug) {
                  window.open(`/blog/${previewPost.slug}`, '_blank');
                }
              }}
              disabled={!previewPost.slug}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                {/* Featured Image */}
                {previewPost.featured_image && (
                  <div className="aspect-video overflow-hidden rounded-lg mb-6">
                    <img
                      src={previewPost.featured_image}
                      alt={previewPost.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Title */}
                <CardTitle className="text-3xl md:text-4xl font-bold mb-4 font-cyber">
                  {previewPost.title}
                </CardTitle>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getReadingTime(previewPost.content)} min read
                  </div>
                  <Badge 
                    variant={previewPost.status === 'published' ? 'default' : 'secondary'}
                  >
                    {previewPost.status}
                  </Badge>
                </div>

                {/* Tags */}
                {previewPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {previewPost.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Excerpt */}
                {previewPost.excerpt && (
                  <div className="text-lg text-muted-foreground border-l-4 border-primary pl-4 mb-6">
                    {previewPost.excerpt}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {/* Blog Content */}
                {previewPost.content ? (
                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none
                      prose-headings:font-cyber prose-headings:text-foreground
                      prose-p:text-foreground prose-p:leading-relaxed
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-muted prose-pre:border prose-pre:border-border
                      prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                      prose-img:rounded-lg prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ 
                      __html: processMarkdown(previewPost.content) 
                    }}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No content to preview</p>
                    <p className="text-sm">Add some content to see the preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}