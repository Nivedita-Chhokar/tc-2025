import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { blogService } from '../services/blogService';
import { BlogPost } from '../types';
import { format } from 'date-fns';
import ConfirmDialog from './ConfirmDialog';

interface UserBlogPostsProps {
  userId: string;
}

const UserBlogPosts: React.FC<UserBlogPostsProps> = ({ userId }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const data = await blogService.getUserPosts(userId);
        setPosts(data);
      } catch (err) {
        setError('Error loading your blog posts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    try {
      await blogService.publishPost(postId, !currentStatus);
      // Update the posts list
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === postId 
            ? { ...post, published: !currentStatus } 
            : post
        )
      );
      
      // Show success message
      setStatusMessage({
        text: `Post ${!currentStatus ? 'published' : 'unpublished'} successfully!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error toggling publish status:', err);
      setStatusMessage({
        text: 'Error updating post status. Please try again.',
        type: 'error'
      });
    }
  };

  const openDeleteDialog = (post: BlogPost) => {
    setSelectedPost(post);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    
    setPendingDeleteId(selectedPost.id);
    setShowDeleteDialog(false);
    
    try {
      await blogService.deletePost(selectedPost.id);
      // Remove the post from the list
      setPosts(currentPosts => currentPosts.filter(post => post.id !== selectedPost.id));
      
      // Show success message
      setStatusMessage({
        text: 'Post deleted successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting post:', err);
      setStatusMessage({
        text: 'Error deleting post. Please try again.',
        type: 'error'
      });
    } finally {
      setPendingDeleteId(null);
      setSelectedPost(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-50 text-red-300 p-4 rounded-md border-l-4 border-red-500 shadow-sm flex items-center">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-sm text-center border border-gray-700">
        <p className="text-gray-300 mb-4">You haven't created any blog posts yet.</p>
        <Link
          to="/blog/new"
          className="inline-block bg-gradient-to-r from-primary to-yellow-500 text-gray-900 px-4 py-2 rounded-md hover:shadow-lg transition-all duration-300"
        >
          Create Your First Post
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Post"
        message={selectedPost ? `Are you sure you want to delete "${selectedPost.title}"?` : 'Are you sure you want to delete this post?'}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />
      
      {/* Status message for displaying notifications */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-md flex items-start border-l-4 ${
          statusMessage.type === 'success' 
            ? 'bg-green-900 bg-opacity-50 text-green-300 border-green-500' 
            : 'bg-red-900 bg-opacity-50 text-red-300 border-red-500'
        }`}>
          {statusMessage.type === 'success' ? (
            <Eye className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
      
      <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-sm bg-gray-800 bg-opacity-60">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/blog/${post.id}`} className="text-primary hover:underline font-medium">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    post.published 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleTogglePublish(post.id, post.published)}
                      className="p-1.5 bg-gray-700 rounded-full text-gray-300 hover:text-primary hover:bg-gray-600 transition-colors"
                      title={post.published ? 'Unpublish' : 'Publish'}
                      disabled={pendingDeleteId === post.id}
                    >
                      {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <Link
                      to={`/blog/edit/${post.id}`}
                      className={`p-1.5 bg-gray-700 rounded-full text-gray-300 hover:text-primary hover:bg-gray-600 transition-colors ${pendingDeleteId === post.id ? 'pointer-events-none opacity-50' : ''}`}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => openDeleteDialog(post)}
                      className="p-1.5 bg-gray-700 rounded-full text-gray-300 hover:text-red-400 hover:bg-gray-600 transition-colors"
                      title="Delete"
                      disabled={pendingDeleteId === post.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserBlogPosts;