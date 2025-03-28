// src/pages/CreateFounderProfile.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FounderProfileForm from '../components/FounderProfileForm';
import { cofounderService } from '../services/cofounderService';
import { FounderProfileInput } from '../types/cofounder';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const CreateFounderProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FounderProfileInput) => {
    if (!user) {
      setError('You must be logged in to create a profile');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await cofounderService.createFounderProfile(data, user.id);
      navigate('/costart');
    } catch (err) {
      console.error('Error creating founder profile:', err);
      setError('Failed to create profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/costart" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Co-Start
        </Link>
        
        <div className="bg-gray-900 bg-opacity-50 rounded-lg shadow-lg p-6 md:p-8 border border-gray-800">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Create Your Founder Profile</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1 mb-6"></div>
            <p className="text-gray-300 mb-6">
              Your founder profile helps you connect with potential co-founders who complement your skills and share your vision.
            </p>
          </div>
          
          <FounderProfileForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateFounderProfile;