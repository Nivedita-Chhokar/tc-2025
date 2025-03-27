import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BlogForm from '../components/BlogForm';
import { blogService } from '../services/blogService';
import { BlogPost, BlogPostInput } from '../types';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const EditBlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await blogService.getPostById(id);
        if (!data) {
          setError('Blog post not found');
          return;
        }
        
        // Check if user is the author of the post
        if (user?.id !== data.author_id) {
          setError('You do not have permission to edit this post');
          return;
        }
        
        setPost(data);
      } catch (err) {
        setError('Error loading blog post. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

  const handleSubmit = async (data: BlogPostInput) => {
    if (!id || !post) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      await blogService.updatePost(id, data);
      navigate(`/blog/${id}`);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update blog post. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !post) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <Link to="/blog" className="flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error || 'Blog post not found'}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to={`/blog/${id}`} className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Post
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Edit Blog Post</h1>
          
          <BlogForm
            initialData={post}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EditBlogPost;