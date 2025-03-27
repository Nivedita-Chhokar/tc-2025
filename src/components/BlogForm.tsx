import React, { useState, useEffect } from 'react';
import { AlertTriangle, Save, Image, X } from 'lucide-react';
import { BlogPostInput, BlogPost } from '../types';

interface BlogFormProps {
  initialData?: BlogPost;
  onSubmit: (data: BlogPostInput) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

const BlogForm: React.FC<BlogFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  error 
}) => {
  const [formData, setFormData] = useState<BlogPostInput>({
    title: '',
    content: '',
    summary: '',
    image_url: '',
    published: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        summary: initialData.summary || '',
        image_url: initialData.image_url || '',
        published: initialData.published
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const clearImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md flex items-start border-l-4 border-red-500">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-300">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          placeholder="Enter a title for your blog post"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="summary" className="block text-sm font-medium text-gray-300">
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          rows={2}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          placeholder="Enter a brief summary (optional)"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500">
          A short description that will appear in blog post previews
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-gray-300">
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={12}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          placeholder="Write your blog post content here..."
          required
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500">
          You can use HTML for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;)
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-300">
          Image URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Image className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="block w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
            placeholder="https://example.com/image.jpg"
            disabled={isSubmitting}
          />
          {formData.image_url && (
            <button
              type="button"
              onClick={clearImageUrl}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Enter a URL for the featured image of your blog post (optional)
        </p>
      </div>

      {formData.image_url && (
        <div className="border border-gray-700 rounded-md overflow-hidden">
          <img 
            src={formData.image_url} 
            alt="Preview" 
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/640x360?text=Image+Not+Found';
            }}
          />
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="published"
          name="published"
          checked={formData.published}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            published: e.target.checked
          }))}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-700 rounded"
          disabled={isSubmitting}
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-300">
          Publish immediately
        </label>
      </div>

      <button
        type="submit"
        className="w-full md:w-auto bg-gradient-to-r from-primary to-yellow-500 text-secondary px-6 py-3 rounded-md font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center transform hover:-translate-y-1"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 
          <>
            <Save className="mr-2 h-5 w-5" />
            Save Post
          </>
        }
      </button>
    </form>
  );
};

export default BlogForm;