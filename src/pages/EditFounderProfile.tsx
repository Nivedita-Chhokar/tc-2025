// src/pages/EditFounderProfile.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import FounderProfileForm from '../components/FounderProfileForm';
import { cofounderService } from '../services/cofounderService';
import { FounderProfile, FounderProfileInput } from '../types/cofounder';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const EditFounderProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const founderProfile = await cofounderService.getFounderProfile(user.id);
        
        if (!founderProfile) {
          // Redirect to create page if no profile exists
          navigate('/costart/profile/create');
          return;
        }
        
        setProfile(founderProfile);
      } catch (err) {
        console.error('Error fetching founder profile:', err);
        setError('Error loading your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSubmit = async (data: FounderProfileInput) => {
    if (!user || !profile) {
      setError('Unable to update profile. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await cofounderService.updateFounderProfile(profile.id, data);
      navigate('/costart');
    } catch (err) {
      console.error('Error updating founder profile:', err);
      setError('Failed to update profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="space-y-4">
        <Link to="/costart" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Co-Start
        </Link>
        <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md border-l-4 border-red-500 shadow flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/costart" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Co-Start
        </Link>
        
        <div className="bg-gray-900 bg-opacity-50 rounded-lg shadow-lg p-6 md:p-8 border border-gray-800">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Edit Your Founder Profile</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1 mb-6"></div>
            <p className="text-gray-300 mb-6">
              Update your founder profile to better connect with potential co-founders.
            </p>
          </div>
          
          {profile && (
            <FounderProfileForm
              initialData={profile}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EditFounderProfile;