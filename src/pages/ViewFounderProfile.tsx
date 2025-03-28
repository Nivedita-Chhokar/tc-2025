// src/pages/ViewFounderProfile.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle, 
  UserPlus, 
  MessageSquare, 
  Star, 
  Check,
  Bookmark, 
  BookmarkCheck,
  ExternalLink
} from 'lucide-react';
import { cofounderService } from '../services/cofounderService';
import { FounderProfileWithUser } from '../types/cofounder';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const ViewFounderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<FounderProfileWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || !user) return;
      
      setLoading(true);
      try {
        // Get the user's own profile
        const userProfile = await cofounderService.getFounderProfile(user.id);
        
        if (!userProfile) {
          navigate('/costart/profile/create');
          return;
        }
        
        // Get all potential matches
        const matches = await cofounderService.getPotentialMatches(user.id);
        
        // Find the requested profile
        const foundProfile = matches.find(match => match.id === id);
        
        if (!foundProfile) {
          setError('Profile not found or unavailable');
          return;
        }
        
        setProfile(foundProfile);
        
        // Check if there's already a match request
        const sentRequests = await cofounderService.getSentMatchRequests(user.id);
        const existingRequest = sentRequests.find(req => req.matched_founder_id === id);
        setRequestSent(!!existingRequest);
        
        // Calculate match score (70-100 range for demo purposes)
        setMatchScore(Math.floor(70 + Math.random() * 30));
        
        // Load saved profiles
        const saved = localStorage.getItem('savedProfiles');
        if (saved) {
          setSavedProfiles(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading founder profile:', err);
        setError('Error loading profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user, navigate]);

  const handleSendRequest = async () => {
    if (!id || !user || !profile) return;
    
    setSendingRequest(true);
    try {
      const userProfile = await cofounderService.getFounderProfile(user.id);
      
      if (!userProfile) {
        setError('Your profile could not be found');
        return;
      }
      
      await cofounderService.createMatch(userProfile.id, profile.id);
      setRequestSent(true);
    } catch (err) {
      console.error('Error sending match request:', err);
      setError('Failed to send match request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };
  
  const toggleSaveProfile = () => {
    if (!profile) return;
    
    setSavedProfiles(prev => {
      let newSaved;
      if (prev.includes(profile.id)) {
        newSaved = prev.filter(id => id !== profile.id);
      } else {
        newSaved = [...prev, profile.id];
      }
      
      // Save to local storage
      localStorage.setItem('savedProfiles', JSON.stringify(newSaved));
      return newSaved;
    });
  };
  
  const isProfileSaved = () => {
    return profile ? savedProfiles.includes(profile.id) : false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/costart/find" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Find Co-Founders
        </Link>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md shadow border-l-4 border-red-500 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {profile && (
          <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="relative">
              {/* Profile header with background gradient */}
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-primary/20 to-yellow-500/20"></div>
              
              <div className="relative p-8">
                {/* Header with profile picture and name */}
                <div className="flex items-center mb-8">
                  <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700 mr-6 shadow-md">
                    {profile.user.avatar_url ? (
                      <img 
                        src={profile.user.avatar_url} 
                        alt={profile.user.full_name} 
                        className="h-full w-full rounded-full object-cover" 
                      />
                    ) : (
                      <UserPlus className="h-12 w-12" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-100 mb-1">{profile.user.full_name}</h1>
                    <p className="text-gray-400 mb-2">{profile.user.bio}</p>
                    <div className="flex items-center space-x-4">
                      {matchScore && (
                        <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                          <Star className="h-4 w-4 text-primary mr-1" />
                          <span className="text-primary font-medium">{matchScore}% match</span>
                        </div>
                      )}
                      
                      <div className="bg-gray-800 px-3 py-1 rounded-full text-gray-300 text-sm">
                        {profile.startup_stage.charAt(0).toUpperCase() + profile.startup_stage.slice(1)} Stage
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <button
                      onClick={toggleSaveProfile}
                      className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors flex items-center justify-center"
                      title={isProfileSaved() ? "Remove from saved" : "Save profile"}
                    >
                      {isProfileSaved() ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {!requestSent ? (
                      <button
                        onClick={handleSendRequest}
                        disabled={sendingRequest}
                        className="bg-gradient-to-r from-primary to-yellow-500 text-secondary py-2 px-4 rounded-md flex items-center font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-70"
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        {sendingRequest ? 'Sending...' : 'Send Match Request'}
                      </button>
                    ) : (
                      <div className="bg-green-800 text-green-200 py-2 px-4 rounded-md flex items-center font-medium">
                        <Check className="h-5 w-5 mr-2" />
                        Request Sent
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Profile details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                      <span className="h-1 w-6 bg-primary mr-2 rounded-full"></span>
                      Skills & Expertise
                    </h2>
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
                    
                    <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                      <span className="h-1 w-6 bg-primary mr-2 rounded-full"></span>
                      Industries
                    </h2>
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
                    
                    <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                      <span className="h-1 w-6 bg-primary mr-2 rounded-full"></span>
                      Work Style
                    </h2>
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
                    <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                      <span className="h-1 w-6 bg-primary mr-2 rounded-full"></span>
                      Goals
                    </h2>
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-md mb-6">
                      <p className="text-gray-300 whitespace-pre-line">{profile.goals}</p>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                      <span className="h-1 w-6 bg-primary mr-2 rounded-full"></span>
                      Experience
                    </h2>
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-md mb-6">
                      <p className="text-gray-300 whitespace-pre-line">{profile.experience}</p>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                      <span className="h-1 w-6 bg-primary mr-2 rounded-full"></span>
                      Seeking
                    </h2>
                    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-md">
                      <p className="text-gray-300 whitespace-pre-line">{profile.seeking}</p>
                    </div>
                  </div>
                </div>
                
                {/* CTA section */}
                <div className="bg-gray-800 bg-opacity-70 rounded-md p-6 flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-1">Interested in collaborating?</h3>
                    <p className="text-gray-400">
                      Send a match request to start exploring a potential co-founder partnership
                    </p>
                  </div>
                  
                  {!requestSent ? (
                    <button
                      onClick={handleSendRequest}
                      disabled={sendingRequest}
                      className="mt-4 md:mt-0 bg-gradient-to-r from-primary to-yellow-500 text-secondary py-2 px-6 rounded-md font-medium flex items-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {sendingRequest ? 'Sending...' : 'Send Match Request'}
                    </button>
                  ) : (
                    <div className="mt-4 md:mt-0 bg-green-800 text-green-200 py-2 px-6 rounded-md font-medium flex items-center">
                      <Check className="h-5 w-5 mr-2" />
                      Request Sent
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ViewFounderProfile;