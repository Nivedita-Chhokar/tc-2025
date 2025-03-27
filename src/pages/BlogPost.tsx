import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft, Clock, User } from 'lucide-react';
import { blogService } from '../services/blogService';
import { BlogPost as BlogPostType } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setPost(data);
      } catch (err) {
        setError('Error loading blog post. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!post || !window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await blogService.deletePost(post.id);
      navigate('/blog');
    } catch (err) {
      setError('Error deleting post. Please try again later.');
      console.error(err);
      setIsDeleting(false);
    }
  };

  const isAuthor = user && post && user.id === post.author_id;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-4">
        <Link to="/blog" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || 'Blog post not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/blog" className="flex items-center text-primary hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Blog
      </Link>

      {post.image_url && (
        <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          
          {isAuthor && (
            <div className="flex space-x-2">
              <Link 
                to={`/blog/edit/${post.id}`}
                className="p-2 text-gray-600 hover:text-primary transition-colors"
              >
                <Edit className="h-5 w-5" />
              </Link>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{post.author_name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
          </div>
        </div>

        <div className="prose max-w-none">
          {/* Render content as HTML - Note: Ensure content is sanitized on the server */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </div>
  );
};

export default BlogPost;