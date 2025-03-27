import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, User, Clock } from 'lucide-react';
import { blogService } from '../services/blogService';
import { BlogPost } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const Blog = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await blogService.getPublishedPosts();
        setPosts(data);
      } catch (err) {
        setError('Error loading blog posts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog</h1>
        {user && (
          <Link
            to="/blog/new"
            className="bg-primary text-secondary px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span>New Post</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600">No blog posts available yet. Check back later!</p>
          {user && (
            <Link
              to="/blog/new"
              className="text-primary hover:underline mt-2 inline-block"
            >
              Be the first to create a post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Link 
              key={post.id} 
              to={`/blog/${post.id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {post.image_url && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>
                {post.summary && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.summary}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{post.author_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;