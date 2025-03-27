import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BlogForm from '../components/BlogForm';
import { blogService } from '../services/blogService';
import { BlogPostInput } from '../types';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const CreateBlogPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BlogPostInput) => {
    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const newPost = await blogService.createPost(data, user.id);
      navigate(`/blog/${newPost.id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create blog post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/blog" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
        
        <div className="bg-gray-900 bg-opacity-50 rounded-lg shadow-lg p-6 md:p-8 border border-gray-800">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Create New Blog Post</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1 mb-6"></div>
          </div>
          
          <BlogForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateBlogPost;