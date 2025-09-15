import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBlog, BlogPost as BlogPostType } from "@/hooks/use-blog";
import { processMarkdown } from "@/lib/markdown";
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getPostBySlug } = useBlog();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    try {
      const blogPost = await getPostBySlug(postSlug);
      setPost(blogPost);
    } catch (error) {
      console.error('Error loading blog post:', error);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const sharePost = async () => {
    const url = window.location.href;
    const title = post?.title || 'Blog Post';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground noise-bg">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground noise-bg">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground noise-bg">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              {/* Featured Image */}
              {post.featured_image && (
                <div className="aspect-video overflow-hidden rounded-lg mb-6">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 font-cyber">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getReadingTime(post.content)} min read
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sharePost}
                  className="h-auto p-1"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <div className="text-lg text-muted-foreground border-l-4 border-primary pl-4 mb-6">
                  {post.excerpt}
                </div>
              )}
            </CardHeader>

            <CardContent>
              {/* Blog Content */}
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
                  __html: processMarkdown(post.content) 
                }}
                ref={(node) => {
                  if (node) {
                    // Delegated click handler for copy buttons
                    const handler = async (e: Event) => {
                      const target = e.target as HTMLElement;
                      const btn = target.closest('.copy-code-button') as HTMLElement | null;
                      if (btn && node.contains(btn)) {
                        e.preventDefault();
                        const codeId = btn.getAttribute('data-code-id');
                        if (codeId) {
                          const codeEl = node.querySelector(`#${CSS.escape(codeId)}`) as HTMLElement | null;
                          if (codeEl) {
                            try {
                              const text = codeEl.textContent || '';
                              await navigator.clipboard.writeText(text);
                              btn.textContent = 'Copied!';
                              setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
                            } catch {}
                          }
                        }
                      }
                    };
                    node.addEventListener('click', handler);
                    // Prevent native title tooltips on copy buttons
                    const buttons = node.querySelectorAll('.copy-code-button');
                    buttons.forEach((b) => b.removeAttribute('title'));
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-12 text-center">
            <Button onClick={() => navigate('/blog')} size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}