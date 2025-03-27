import { supabase } from '../lib/supabase';
import { BlogPost, BlogPostInput } from '../types';

export const blogService = {
  async getPublishedPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts_with_authors')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching published posts:', error);
      throw error;
    }
    
    return data as BlogPost[];
  },

  async getUserPosts(userId: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts_with_authors')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
    
    return data as BlogPost[];
  },

  async getPostById(postId: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts_with_authors')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching post by ID:', error);
      throw error;
    }
    
    return data as BlogPost;
  },

  async createPost(post: BlogPostInput, authorId: string): Promise<BlogPost> {
    const newPost = {
      ...post,
      author_id: authorId,
    };
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(newPost)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }
    
    return data as BlogPost;
  },

  async updatePost(postId: string, updates: Partial<BlogPostInput>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }
    
    return data as BlogPost;
  },

async deletePost(postId: string): Promise<void> {
  console.log('blogService: Attempting to delete post with ID:', postId);
  
  if (!postId) {
    throw new Error('Post ID is required for deletion');
  }
  
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId);
  
  if (error) {
    console.error('Error deleting post from Supabase:', error);
    throw error;
  }
  
  console.log('blogService: Successfully deleted post with ID:', postId);
},

  async publishPost(postId: string, publish: boolean): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ 
        published: publish,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error publishing post:', error);
      throw error;
    }
    
    return data as BlogPost;
  }
};