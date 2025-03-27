import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { UserIcon, Mail, Save, AlertCircle, FileText } from 'lucide-react';
import UserBlogPosts from '../components/UserBlogPosts';

interface ProfileData {
  full_name: string;
  bio: string;
  avatar_url?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    bio: '',
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProfileData({
            full_name: data.full_name || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user changes something
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          bio: profileData.bio,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while saving your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Your Profile</h1>
        <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1"></div>
      </div>
      
      <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg p-8 border border-gray-800">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center text-gray-400 shadow-md border border-gray-700">
            {profileData.avatar_url ? (
              <img 
                src={profileData.avatar_url} 
                alt="Profile" 
                className="h-full w-full rounded-full object-cover" 
              />
            ) : (
              <UserIcon className="h-10 w-10" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">{profileData.full_name || 'Your Name'}</h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 bg-green-900 bg-opacity-50 text-green-300 p-3 rounded-md flex items-start border-l-4 border-green-500">
            <Save className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-50 text-red-300 p-3 rounded-md flex items-start border-l-4 border-red-500">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-gray-300"
                disabled
              />
            </div>
            <p className="text-xs text-gray-500">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profileData.full_name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-gray-300 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-gray-300 focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Tell us about yourself..."
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-primary to-yellow-500 text-gray-900 px-5 py-2 rounded-md font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
            {!saving && <Save className="ml-2 h-4 w-4" />}
          </button>
        </form>
      </div>

      {/* User's Blog Posts Section */}
      <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg p-8 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center text-gray-100">
              <FileText className="h-6 w-6 mr-2 text-primary" />
              My Blog Posts
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1"></div>
          </div>
        </div>
        
        {user && <UserBlogPosts userId={user.id} />}
      </div>
    </div>
  );
};

export default Profile;