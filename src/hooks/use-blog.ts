import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import { sanitizeInput, validateImageUrl, AuditLogger, RateLimiter } from "@/lib/security";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPost {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface UpdateBlogPost extends Partial<CreateBlogPost> {
  id: string;
}

// Generate URL-friendly slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 100); // Limit length
};

export function useBlog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  // Load posts
  const loadPosts = useCallback(async (includeUnpublished = false) => {
    setLoading(true);
    
    if (!isSupabaseConfigured) {
      // Local mode: load from localStorage
      const localPosts = localStorage.getItem('local_blog_posts');
      if (localPosts) {
        try {
          const parsed = JSON.parse(localPosts) as BlogPost[];
          setPosts(includeUnpublished ? parsed : parsed.filter(p => p.status === 'published'));
        } catch (error) {
          console.error('Error parsing local blog posts:', error);
          setPosts([]);
        }
      } else {
        setPosts([]);
      }
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeUnpublished) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Failed to load blog posts');
        console.error('Error loading posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      toast.error('Failed to load blog posts');
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new post
  const createPost = useCallback(async (postData: CreateBlogPost): Promise<BlogPost | null> => {
    if (!user && isSupabaseConfigured) {
      toast.error('You must be logged in to create posts');
      return null;
    }

    // Rate limiting
    const rateLimitKey = `create_post_${user?.id || 'local'}`;
    if (!RateLimiter.isAllowed(rateLimitKey, 5, 300000)) { // 5 posts per 5 minutes
      toast.error('Too many posts created recently. Please wait before creating another.');
      return null;
    }

    // Sanitize and validate inputs
    const sanitizedData = {
      title: sanitizeInput(postData.title.trim()),
      content: sanitizeInput(postData.content.trim()),
      excerpt: postData.excerpt ? sanitizeInput(postData.excerpt.trim()) : undefined,
      featured_image: postData.featured_image ? sanitizeInput(postData.featured_image.trim()) : undefined,
      tags: postData.tags.map(tag => sanitizeInput(tag.trim())).filter(tag => tag.length > 0),
      status: postData.status
    };

    // Validate image URL if provided
    if (sanitizedData.featured_image && !validateImageUrl(sanitizedData.featured_image)) {
      toast.error('Invalid or unsafe image URL');
      return null;
    }

    // Validate content length
    if (sanitizedData.content.length > 50000) {
      toast.error('Content is too long (maximum 50,000 characters)');
      return null;
    }

    const slug = generateSlug(sanitizedData.title);
    const now = new Date().toISOString();
    
    const newPost: BlogPost = {
      id: crypto.randomUUID(),
      ...sanitizedData,
      slug,
      published_at: sanitizedData.status === 'published' ? now : undefined,
      created_at: now,
      updated_at: now,
    };

    if (!isSupabaseConfigured) {
      // Local mode
      const existingPosts = localStorage.getItem('local_blog_posts');
      const posts = existingPosts ? JSON.parse(existingPosts) : [];
      
      // Check for duplicate slug
      if (posts.some((p: BlogPost) => p.slug === slug)) {
        toast.error('A post with this title already exists');
        return null;
      }
      
      posts.unshift(newPost);
      localStorage.setItem('local_blog_posts', JSON.stringify(posts));
      
      AuditLogger.log('blog_post_created', {
        postId: newPost.id,
        title: newPost.title,
        status: newPost.status,
        method: 'local_storage'
      });
      
      toast.success('Blog post created successfully');
      setPosts(posts => [newPost, ...posts]);
      return newPost;
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...sanitizedData,
          slug,
          owner: user!.id,
          published_at: sanitizedData.status === 'published' ? now : null,
        })
        .select()
        .single();

      if (error) {
        AuditLogger.log('blog_post_create_failed', {
          error: error.message,
          code: error.code,
          method: 'supabase'
        });
        
        if (error.code === '23505') { // Unique constraint violation
          toast.error('A post with this title already exists');
        } else {
          toast.error('Failed to create blog post');
        }
        console.error('Error creating post:', error);
        return null;
      }

      AuditLogger.log('blog_post_created', {
        postId: data.id,
        title: data.title,
        status: data.status,
        method: 'supabase'
      });

      toast.success('Blog post created successfully');
      setPosts(posts => [data, ...posts]);
      return data;
    } catch (error) {
      AuditLogger.log('blog_post_create_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'supabase'
      });
      toast.error('Failed to create blog post');
      console.error('Error creating post:', error);
      return null;
    }
  }, [user]);

  // Update post
  const updatePost = useCallback(async (postData: UpdateBlogPost): Promise<boolean> => {
    if (!user && isSupabaseConfigured) {
      toast.error('You must be logged in to update posts');
      return false;
    }

    const now = new Date().toISOString();
    const updateData = {
      ...postData,
      updated_at: now,
    };

    // Update slug if title changed
    if (postData.title) {
      updateData.slug = generateSlug(postData.title);
    }

    // Set published_at if status changed to published
    if (postData.status === 'published') {
      // Check if this post was previously unpublished - get from localStorage for accuracy
      if (!isSupabaseConfigured) {
        const localPosts = localStorage.getItem('local_blog_posts');
        if (localPosts) {
          const posts = JSON.parse(localPosts) as BlogPost[];
          const existingPost = posts.find(p => p.id === postData.id);
          if (existingPost && existingPost.status !== 'published') {
            updateData.published_at = now;
          }
        }
      } else {
        // For Supabase, we'll handle this in the database query logic
        updateData.published_at = now; // Set it anyway, database can handle duplicates
      }
    }

    if (!isSupabaseConfigured) {
      // Local mode
      const existingPosts = localStorage.getItem('local_blog_posts');
      if (!existingPosts) return false;
      
      const posts = JSON.parse(existingPosts) as BlogPost[];
      const postIndex = posts.findIndex(p => p.id === postData.id);
      
      if (postIndex === -1) {
        toast.error('Post not found');
        return false;
      }

      // Check for duplicate slug if title changed
      if (updateData.slug && posts.some((p, i) => i !== postIndex && p.slug === updateData.slug)) {
        toast.error('A post with this title already exists');
        return false;
      }

      posts[postIndex] = { ...posts[postIndex], ...updateData };
      localStorage.setItem('local_blog_posts', JSON.stringify(posts));
      toast.success('Blog post updated successfully');
      setPosts(posts => posts.map(p => p.id === postData.id ? { ...p, ...updateData } : p));
      return true;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postData.id)
        .eq('owner', user!.id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('A post with this title already exists');
        } else {
          toast.error('Failed to update blog post');
        }
        console.error('Error updating post:', error);
        return false;
      }

      toast.success('Blog post updated successfully');
      setPosts(posts => posts.map(p => p.id === postData.id ? { ...p, ...updateData } : p));
      return true;
    } catch (error) {
      toast.error('Failed to update blog post');
      console.error('Error updating post:', error);
      return false;
    }
  }, [user]);

  // Delete post
  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    if (!user && isSupabaseConfigured) {
      toast.error('You must be logged in to delete posts');
      return false;
    }

    if (!isSupabaseConfigured) {
      // Local mode
      const existingPosts = localStorage.getItem('local_blog_posts');
      if (!existingPosts) return false;
      
      const posts = JSON.parse(existingPosts) as BlogPost[];
      const filteredPosts = posts.filter(p => p.id !== postId);
      
      localStorage.setItem('local_blog_posts', JSON.stringify(filteredPosts));
      toast.success('Blog post deleted successfully');
      setPosts(posts => posts.filter(p => p.id !== postId));
      return true;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)
        .eq('owner', user!.id);

      if (error) {
        toast.error('Failed to delete blog post');
        console.error('Error deleting post:', error);
        return false;
      }

      toast.success('Blog post deleted successfully');
      setPosts(posts => posts.filter(p => p.id !== postId));
      return true;
    } catch (error) {
      toast.error('Failed to delete blog post');
      console.error('Error deleting post:', error);
      return false;
    }
  }, [user]);

  // Get single post by slug
  const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    if (!isSupabaseConfigured) {
      const localPosts = localStorage.getItem('local_blog_posts');
      if (localPosts) {
        try {
          const posts = JSON.parse(localPosts) as BlogPost[];
          return posts.find(p => p.slug === slug && p.status === 'published') || null;
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  };



  return {
    posts,
    loading,
    loadPosts,
    createPost,
    updatePost,
    deletePost,
    getPostBySlug,
  };
}