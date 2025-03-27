import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft, Clock, User } from 'lucide-react';
import { blogService } from '../services/blogService';
import { BlogPost as BlogPostType } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    setShowDeleteDialog(false);
    
    try {
      await blogService.deletePost(id);
      // Redirect to blog list after successful deletion
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
        <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md border-l-4 border-red-500 shadow">
          {error || 'Blog post not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Post"
        message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />

      <Link to="/blog" className="flex items-center text-primary hover:underline group">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Blog</span>
      </Link>

      {post.image_url && (
        <div className="w-full h-64 md:h-96 overflow-hidden rounded-xl shadow-lg">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg p-6 md:p-8 border border-gray-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">{post.title}</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-2"></div>
          </div>
          
          {isAuthor && (
            <div className="flex space-x-2">
              <Link 
                to={`/blog/edit/${post.id}`}
                className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-primary hover:bg-gray-700 transition-colors"
                title="Edit post"
              >
                <Edit className="h-5 w-5" />
              </Link>
              <button 
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-red-400 hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Delete post"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-6 border-b border-gray-700 pb-4">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span className="font-medium">{post.author_name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
          </div>
        </div>

        <article className="prose max-w-none prose-invert prose-headings:text-gray-200 prose-headings:font-bold prose-a:text-primary prose-p:text-gray-300">
          {/* Render content as HTML - Note: Ensure content is sanitized on the server */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>
    </div>
  );
};

export default BlogPost;