import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useBlog, BlogPost, CreateBlogPost, UpdateBlogPost } from "@/hooks/use-blog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Calendar, Tag, FileText, Save, X, ExternalLink } from "lucide-react";
import BlogPreview from "@/components/admin/BlogPreview";
import PublishNotification from "@/components/admin/PublishNotification";
import { format } from "date-fns";

export default function AdminBlog() {
  const { user } = useAuth();
  const { posts, loading, createPost, updatePost, deletePost, loadPosts } = useBlog();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [publishedPost, setPublishedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<CreateBlogPost>({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
    tags: [],
    status: "draft",
  });
  
  // Use separate controlled state for textareas to avoid input lag
  const [contentValue, setContentValue] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [excerptValue, setExcerptValue] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadPosts(true); // Load all posts including drafts for admin
    }
  }, [user, loadPosts]);

  useEffect(() => {
    // Focus title once when dialog opens
    if (isCreateDialogOpen && titleRef.current) {
      const timer = setTimeout(() => {
        titleRef.current?.focus();
        titleRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCreateDialogOpen]);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      featured_image: "",
      tags: [],
      status: "draft",
    });
    setTitleValue("");
    setContentValue("");
    setExcerptValue("");
    setTagInput("");
    setEditingPost(null);
  };

  const handleCreatePost = async () => {
    // Sync the separate state back to formData before submission
    const finalData = {
      ...formData,
      title: titleValue.trim(),
      content: contentValue.trim(),
      excerpt: excerptValue.trim()
    };
    
    if (!finalData.title || !finalData.content) {
      toast.error("Title and content are required");
      return;
    }

    setSubmitting(true);
    const result = await createPost(finalData);
    setSubmitting(false);

    if (result) {
      setIsCreateDialogOpen(false);
      resetForm();
      
      // Show notification if post was published
      if (result.status === 'published') {
        setPublishedPost(result);
      }
    }
  };

  const handleUpdatePost = async () => {
    // Sync the separate state back to formData before submission
    const finalData = {
      ...formData,
      title: titleValue.trim(),
      content: contentValue.trim(),
      excerpt: excerptValue.trim()
    };
    
    if (!editingPost || !finalData.title || !finalData.content) {
      toast.error("Title and content are required");
      return;
    }

    const wasPublished = editingPost.status === 'published';
    const isNowPublished = finalData.status === 'published';

    setSubmitting(true);
    const success = await updatePost({
      id: editingPost.id,
      ...finalData,
    });
    setSubmitting(false);

    if (success) {
      const updatedId = editingPost.id;
      setEditingPost(null);
      resetForm();
      
      // Show notification if post was newly published or updated while published
      if (isNowPublished) {
        const updatedPost = posts.find(p => p.id === updatedId);
        if (updatedPost) {
          setPublishedPost(updatedPost);
        }
      }
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      featured_image: post.featured_image || "",
      tags: post.tags,
      // Coerce archived posts to a valid editable status
      status: post.status === 'archived' ? 'draft' : post.status,
    });
    // Update separate state
    setTitleValue(post.title);
    setContentValue(post.content);
    setExcerptValue(post.excerpt || "");
    setTagInput("");
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput("");
    }
  }, [tagInput, formData.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  // Memoized input change handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  }, []);

  const handleExcerptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExcerptValue(e.target.value);
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentValue(e.target.value);
  }, []);

  const handleFeaturedImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, featured_image: e.target.value }));
  }, []);

  const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  }, []);

  const handleStatusChange = useCallback((value: "draft" | "published") => {
    setFormData(prev => ({ ...prev, status: value }));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const PostForm = useMemo(() => (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title *</label>
        <Input
          ref={titleRef}
          value={titleValue}
          onChange={handleTitleChange}
          placeholder="Enter post title"
          className="mt-1"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Excerpt</label>
        <Textarea
          value={excerptValue}
          onChange={handleExcerptChange}
          placeholder="Brief description of the post"
          rows={3}
          className="mt-1 resize-y"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Featured Image URL</label>
        <Input
          value={formData.featured_image}
          onChange={handleFeaturedImageChange}
          placeholder="https://example.com/image.jpg"
          className="mt-1"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tags</label>
        <div className="flex gap-2 mt-1">
          <Input
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag and press Enter"
            className="flex-1"
            autoComplete="off"
          />
          <Button type="button" onClick={addTag} size="sm">
            <Tag className="h-4 w-4" />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Content *</label>
        <Textarea
          value={contentValue}
          onChange={handleContentChange}
          placeholder="Write your blog post content here... (Markdown supported)"
          rows={12}
          className="mt-1 font-mono text-sm resize-y"
          style={{ minHeight: '300px' }}
          autoComplete="off"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can use Markdown formatting (e.g., **bold**, *italic*, # headings, etc.)
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Status</label>
        <Select value={formData.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
      </div>
    </form>
  ), [
    titleValue,
    excerptValue,
    contentValue,
    tagInput,
    formData.featured_image,
    formData.tags,
    formData.status,
    handleTitleChange,
    handleExcerptChange,
    handleContentChange,
    handleTagInputChange,
    handleKeyDown,
    handleFeaturedImageChange,
    handleStatusChange,
    addTag,
    removeTag
  ]);

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Blog Management</h1>
            <p className="text-gray-300">Create and manage your blog posts</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>

          {/* Custom Modal */}
          {isCreateDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/80" onClick={() => setIsCreateDialogOpen(false)} />
              <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Create New Blog Post</h2>
                    <p className="text-sm text-muted-foreground">Write and publish a new blog post for your portfolio</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {PostForm}
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPreview(true)}
                    disabled={!titleValue.trim() || !contentValue.trim()}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={handleCreatePost} disabled={submitting}>
                    {submitting ? "Creating..." : "Create Post"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading blog posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-4">Create your first blog post to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </div>
                      {post.excerpt && (
                        <CardDescription className="text-base">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {post.status === 'published' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          title="View on site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePost(post.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.published_at 
                        ? format(new Date(post.published_at), "MMM d, yyyy")
                        : format(new Date(post.created_at), "MMM d, yyyy")
                      }
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {post.tags.slice(0, 3).join(", ")}
                        {post.tags.length > 3 && ` +${post.tags.length - 3} more`}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 line-clamp-3">
                    {post.content.substring(0, 200)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Post Modal */}
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80" onClick={() => setEditingPost(null)} />
            <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Edit Blog Post</h2>
                  <p className="text-sm text-muted-foreground">Update your blog post content and settings</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPost(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {PostForm}
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(true)}
                  disabled={!titleValue.trim() || !contentValue.trim()}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleUpdatePost} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Preview Modal */}
        {showPreview && (
          <BlogPreview 
            post={{
              ...formData,
              title: titleValue,
              content: contentValue,
              excerpt: excerptValue
            }} 
            onClose={() => setShowPreview(false)} 
          />
        )}

        {/* Publish Notification */}
        {publishedPost && (
          <PublishNotification 
            post={publishedPost} 
            onClose={() => setPublishedPost(null)} 
          />
        )}
      </div>
    </div>
  );
}