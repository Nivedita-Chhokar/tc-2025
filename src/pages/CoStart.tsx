// src/pages/CoStart.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cofounderService } from '../services/cofounderService';
import { FounderProfile } from '../types/cofounder';
import ProtectedRoute from '../components/ProtectedRoute';

const CoStart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch founder profile
        const founderProfile = await cofounderService.getFounderProfile(user.id);
        setProfile(founderProfile);
        
        if (founderProfile) {
          // Fetch pending requests
          const receivedRequests = await cofounderService.getReceivedMatchRequests(user.id);
          setPendingRequests(receivedRequests.length);
          
          // Fetch matches
          const acceptedMatches = await cofounderService.getAcceptedMatches(user.id);
          setMatches(acceptedMatches.length);
        }
      } catch (err) {
        console.error('Error loading Co-Start data:', err);
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Co-Start</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1"></div>
            <p className="mt-2 text-gray-300">Find your perfect co-founder match and build your startup together</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md shadow border-l-4 border-red-500 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!profile ? (
          <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg p-8 border border-gray-800 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Create Your Founder Profile</h2>
            <p className="text-gray-300 mb-6">
              Your founder profile helps you connect with potential co-founders who complement your skills and share your vision.
            </p>
            <button 
              onClick={() => navigate('/costart/profile/create')}
              className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-6 py-3 rounded-md font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Create Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Find Co-Founders Card */}
            <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group">
              <div className="p-6">
                <UserPlus className="h-10 w-10 mb-4 text-primary" />
                <h2 className="text-xl font-bold mb-2 text-gray-100 group-hover:text-primary transition-colors">
                  Find Co-Founders
                </h2>
                <div className="h-1 w-12 bg-gradient-to-r from-primary to-yellow-500 rounded-full mb-4 group-hover:w-16 transition-all duration-300"></div>
                <p className="text-gray-300 mb-6">
                  Discover potential co-founders who match your skills, interests, and startup vision.
                </p>
                <button 
                  onClick={() => navigate('/costart/find')}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 px-4 rounded-md transition-colors"
                >
                  Browse Matches
                </button>
              </div>
            </div>

            {/* Requests Card */}
            <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group">
              <div className="p-6">
                <UserCheck className="h-10 w-10 mb-4 text-primary" />
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-100 group-hover:text-primary transition-colors">
                    Match Requests
                  </h2>
                  {pendingRequests > 0 && (
                    <div className="bg-primary text-gray-900 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                      {pendingRequests}
                    </div>
                  )}
                </div>
                <div className="h-1 w-12 bg-gradient-to-r from-primary to-yellow-500 rounded-full mb-4 group-hover:w-16 transition-all duration-300"></div>
                <p className="text-gray-300 mb-6">
                  {pendingRequests > 0 
                    ? `You have ${pendingRequests} pending requests from potential co-founders.`
                    : 'Review and respond to co-founder match requests.'}
                </p>
                <button 
                  onClick={() => navigate('/costart/requests')}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 px-4 rounded-md transition-colors"
                >
                  View Requests
                </button>
              </div>
            </div>

            {/* Matches Card */}
            <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group">
              <div className="p-6">
                <MessageSquare className="h-10 w-10 mb-4 text-primary" />
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-100 group-hover:text-primary transition-colors">
                    Your Matches
                  </h2>
                  {matches > 0 && (
                    <div className="bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                      {matches}
                    </div>
                  )}
                </div>
                <div className="h-1 w-12 bg-gradient-to-r from-primary to-yellow-500 rounded-full mb-4 group-hover:w-16 transition-all duration-300"></div>
                <p className="text-gray-300 mb-6">
                  {matches > 0 
                    ? `Collaborate with your ${matches} matched co-founders and start building.`
                    : 'Connect with matched co-founders and start collaborating on your startup.'}
                </p>
                <button 
                  onClick={() => navigate('/costart/matches')}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 px-4 rounded-md transition-colors"
                >
                  View Matches
                </button>
              </div>
            </div>
          </div>
        )}

        {profile && (
          <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg p-8 border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-100">Your Founder Profile</h2>
                <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1"></div>
              </div>
              <button 
                onClick={() => navigate('/costart/profile/edit')}
                className="text-primary hover:text-yellow-400 transition-colors"
              >
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.skills.map(skill => (
                    <span 
                      key={skill.id} 
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium text-primary mb-2">Industries</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.industries.map(industry => (
                    <span 
                      key={industry.id} 
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {industry.name}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium text-primary mb-2">Startup Stage</h3>
                <p className="text-gray-300 mb-6">
                  {profile.startup_stage.charAt(0).toUpperCase() + profile.startup_stage.slice(1)}
                </p>
                
                <h3 className="text-lg font-medium text-primary mb-2">Work Style</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.work_style.map(style => (
                    <span 
                      key={style.id} 
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {style.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Goals</h3>
                <p className="text-gray-300 mb-6 whitespace-pre-line">{profile.goals}</p>
                
                <h3 className="text-lg font-medium text-primary mb-2">Experience</h3>
                <p className="text-gray-300 mb-6 whitespace-pre-line">{profile.experience}</p>
                
                <h3 className="text-lg font-medium text-primary mb-2">Seeking</h3>
                <p className="text-gray-300 whitespace-pre-line">{profile.seeking}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default CoStart;