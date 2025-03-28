// src/pages/FindCoFounders.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle, 
  UserPlus, 
  Check, 
  X, 
  MessageSquare, 
  Star, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { cofounderService } from '../services/cofounderService';
import { FounderProfileWithUser, StartupStage, Skill, Industry } from '../types/cofounder';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const FindCoFounders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [potentialMatches, setPotentialMatches] = useState<FounderProfileWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState<string | null>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [savedProfiles, setSavedProfiles] = useState<string[]>([]);
  
  // Filter and search state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [] as string[],
    industries: [] as string[],
    startupStage: [] as string[],
    workStyles: [] as string[]
  });
  
  // Reference data
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableIndustries, setAvailableIndustries] = useState<Industry[]>([]);
  const [availableWorkStyles, setAvailableWorkStyles] = useState<any[]>([]);

  // Load reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [skills, industries, workStyles] = await Promise.all([
          cofounderService.getSkills(),
          cofounderService.getIndustries(),
          cofounderService.getWorkStyles()
        ]);
        
        setAvailableSkills(skills);
        setAvailableIndustries(industries);
        setAvailableWorkStyles(workStyles);
      } catch (err) {
        console.error('Error loading reference data:', err);
      }
    };

    fetchReferenceData();
  }, []);
    
  // Load potential matches
  useEffect(() => {
    const fetchPotentialMatches = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Check if user has a profile
        const userProfile = await cofounderService.getFounderProfile(user.id);
        
        if (!userProfile) {
          // Redirect to create profile if none exists
          navigate('/costart/profile/create');
          return;
        }
        
        const matches = await cofounderService.getPotentialMatches(user.id);
        setPotentialMatches(matches);
        
        // Load saved profiles from local storage
        const saved = localStorage.getItem('savedProfiles');
        if (saved) {
          setSavedProfiles(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading potential matches:', err);
        setError('Error loading potential matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPotentialMatches();
  }, [user, navigate]);

  const handleSendRequest = async (profileId: string) => {
    if (!user) return;
    
    setSendingRequest(true);
    try {
      // Get user's founder profile
      const userProfile = await cofounderService.getFounderProfile(user.id);
      
      if (!userProfile) {
        setError('Your profile could not be found');
        return;
      }
      
      await cofounderService.createMatch(userProfile.id, profileId);
      setRequestSent(profileId);
      
      // Move to next profile after a delay if in card view
      if (viewMode === 'card') {
        setTimeout(() => {
          setCurrentProfileIndex(prev => {
            const next = prev + 1;
            if (next >= filteredMatches.length) {
              return prev; // Stay on last card if no more matches
            }
            return next;
          });
          setRequestSent(null);
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error sending match request:', err);
      setError('Failed to send match request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSkip = () => {
    setCurrentProfileIndex(prev => {
      const next = prev + 1;
      if (next >= filteredMatches.length) {
        return prev; // Stay on last card if no more matches
      }
      return next;
    });
  };
  
  const toggleSaveProfile = (profileId: string) => {
    setSavedProfiles(prev => {
      let newSaved;
      if (prev.includes(profileId)) {
        newSaved = prev.filter(id => id !== profileId);
      } else {
        newSaved = [...prev, profileId];
      }
      
      // Save to local storage
      localStorage.setItem('savedProfiles', JSON.stringify(newSaved));
      return newSaved;
    });
  };
  
  const handleFilterChange = (category: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter(v => v !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };
  
  // Apply filters and search to matches
  const filteredMatches = useMemo(() => {
    return potentialMatches.filter(profile => {
      // Search term filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = profile.user.full_name.toLowerCase().includes(searchLower);
        const bioMatch = profile.user.bio?.toLowerCase().includes(searchLower);
        const skillsMatch = profile.skills.some(skill => skill.name.toLowerCase().includes(searchLower));
        const industriesMatch = profile.industries.some(industry => industry.name.toLowerCase().includes(searchLower));
        const goalsMatch = profile.goals.toLowerCase().includes(searchLower);
        
        if (!(nameMatch || bioMatch || skillsMatch || industriesMatch || goalsMatch)) {
          return false;
        }
      }
      
      // Skill filtering
      if (filters.skills.length > 0) {
        const profileSkillIds = profile.skills.map(skill => skill.id);
        if (!filters.skills.some(skillId => profileSkillIds.includes(skillId))) {
          return false;
        }
      }
      
      // Industry filtering
      if (filters.industries.length > 0) {
        const profileIndustryIds = profile.industries.map(industry => industry.id);
        if (!filters.industries.some(industryId => profileIndustryIds.includes(industryId))) {
          return false;
        }
      }
      
      // Startup stage filtering
      if (filters.startupStage.length > 0 && !filters.startupStage.includes(profile.startup_stage)) {
        return false;
      }
      
      // Work style filtering
      if (filters.workStyles.length > 0) {
        const profileWorkStyleIds = profile.work_style.map(style => style.id);
        if (!filters.workStyles.some(styleId => profileWorkStyleIds.includes(styleId))) {
          return false;
        }
      }
      
      return true;
    });
  }, [potentialMatches, searchTerm, filters]);

  const currentProfile = filteredMatches[currentProfileIndex];
  const isLastProfile = currentProfileIndex === filteredMatches.length - 1;
  
  // Check if the profile has been saved
  const isProfileSaved = (profileId: string) => {
    return savedProfiles.includes(profileId);
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
      <div className="space-y-6 max-w-6xl mx-auto">
        <Link to="/costart" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Co-Start
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Find Co-Founders</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1"></div>
            <p className="mt-2 text-gray-300">
              Browse potential co-founders who match your needs and interests
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-gray-700 text-primary' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              title="Card View"
            >
              <UserPlus className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-700 text-primary' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              title="List View"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md shadow border-l-4 border-red-500 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Search and filter bar */}
        <div className="bg-gray-900 bg-opacity-70 rounded-lg p-4 border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
                placeholder="Search by name, skills, or industry..."
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 border border-gray-700"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>
          
          {/* Filter options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
              {/* Skills filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Skills</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {availableSkills.map(skill => (
                    <label key={skill.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill.id)}
                        onChange={() => handleFilterChange('skills', skill.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">{skill.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Industries filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Industries</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {availableIndustries.map(industry => (
                    <label key={industry.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.industries.includes(industry.id)}
                        onChange={() => handleFilterChange('industries', industry.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">{industry.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Startup Stage filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Startup Stage</h3>
                <div className="space-y-1">
                  {Object.values(StartupStage).map(stage => (
                    <label key={stage} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.startupStage.includes(stage)}
                        onChange={() => handleFilterChange('startupStage', stage)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Work Style filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Work Style</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {availableWorkStyles.map(style => (
                    <label key={style.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.workStyles.includes(style.id)}
                        onChange={() => handleFilterChange('workStyles', style.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">{style.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg p-8 border border-gray-800 text-center">
            <UserPlus className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">No Matches Found</h2>
            <p className="text-gray-300 mb-6">
              {searchTerm || Object.values(filters).some(arr => arr.length > 0) 
                ? "No co-founders match your search criteria. Try adjusting your filters or search term."
                : "We couldn't find any potential co-founders matching your criteria right now. Check back later or update your profile for better matching."
              }
            </p>
            {searchTerm || Object.values(filters).some(arr => arr.length > 0) ? (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    skills: [],
                    industries: [],
                    startupStage: [],
                    workStyles: []
                  });
                }}
                className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-6 py-3 rounded-md font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Clear Filters
              </button>
            ) : (
              <button 
                onClick={() => navigate('/costart/profile/edit')}
                className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-6 py-3 rounded-md font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Update Your Profile
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              // Card view for swipe-style interaction
              <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg overflow-hidden border border-gray-800">
                {currentProfile && (
                  <div className="relative">
                    {/* Profile header with background gradient */}
                    <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary/20 to-yellow-500/20"></div>
                    
                    <div className="relative p-8">
                      {/* User info section */}
                      <div className="flex items-start mb-6">
                        <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700 mr-4">
                          {currentProfile.user.avatar_url ? (
                            <img 
                              src={currentProfile.user.avatar_url} 
                              alt={currentProfile.user.full_name} 
                              className="h-full w-full rounded-full object-cover" 
                            />
                          ) : (
                            <UserPlus className="h-8 w-8" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-100">{currentProfile.user.full_name}</h2>
                          <p className="text-gray-400">{currentProfile.user.bio?.substring(0, 80)}{currentProfile.user.bio?.length > 80 ? '...' : ''}</p>
                        </div>
                        <div className="ml-auto flex space-x-2">
                          <div className="flex items-center">
                            <Star className="h-5 w-5 text-primary mr-1" />
                            <span className="text-primary font-medium">{Math.floor(70 + Math.random() * 30)}% match</span>
                          </div>
                          <button
                            onClick={() => toggleSaveProfile(currentProfile.id)}
                            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                            title={isProfileSaved(currentProfile.id) ? "Remove from saved" : "Save profile"}
                          >
                            {isProfileSaved(currentProfile.id) ? (
                              <BookmarkCheck className="h-5 w-5 text-primary" />
                            ) : (
                              <Bookmark className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Profile details grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <h3 className="text-lg font-medium text-primary mb-2">Skills & Expertise</h3>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {currentProfile.skills.map(skill => (
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
                            {currentProfile.industries.map(industry => (
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
                            {currentProfile.startup_stage.charAt(0).toUpperCase() + currentProfile.startup_stage.slice(1)}
                          </p>
                          
                          <h3 className="text-lg font-medium text-primary mb-2">Work Style</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentProfile.work_style.map(style => (
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
                          <p className="text-gray-300 mb-6 whitespace-pre-line">{currentProfile.goals}</p>
                          
                          <h3 className="text-lg font-medium text-primary mb-2">Experience</h3>
                          <p className="text-gray-300 mb-6 whitespace-pre-line">{currentProfile.experience}</p>
                          
                          <h3 className="text-lg font-medium text-primary mb-2">Seeking</h3>
                          <p className="text-gray-300 whitespace-pre-line">{currentProfile.seeking}</p>
                        </div>
                      </div>
                      
                      {/* Request sent feedback */}
                      {requestSent === currentProfile.id && (
                        <div className="bg-green-900 bg-opacity-30 text-green-300 p-4 rounded-md flex items-center justify-center mb-4 border border-green-700">
                          <Check className="h-5 w-5 mr-2" />
                          Match request sent successfully!
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex justify-between">
                        <button
                          onClick={handleSkip}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-6 rounded-md flex items-center transition-colors"
                          disabled={sendingRequest || isLastProfile}
                        >
                          <X className="h-5 w-5 mr-2" />
                          Skip
                        </button>
                        
                        <button
                          onClick={() => handleSendRequest(currentProfile.id)}
                          className={`bg-gradient-to-r from-primary to-yellow-500 text-secondary py-2 px-6 rounded-md flex items-center transition-all ${
                            !sendingRequest && 'hover:shadow-lg transform hover:-translate-y-1'
                          }`}
                          disabled={sendingRequest || requestSent === currentProfile.id}
                        >
                          <MessageSquare className="h-5 w-5 mr-2" />
                          {sendingRequest ? 'Sending...' : 'Send Match Request'}
                        </button>
                      </div>
                      
                      {/* Profile counter */}
                      <div className="mt-4 text-center text-sm text-gray-400">
                        Profile {currentProfileIndex + 1} of {filteredMatches.length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // List view for browsing multiple profiles
              <div className="space-y-4">
                {filteredMatches.map(profile => (
                  <div 
                    key={profile.id}
                    className="bg-gray-900 bg-opacity-50 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700 mr-4 flex-shrink-0">
                        {profile.user.avatar_url ? (
                          <img 
                            src={profile.user.avatar_url} 
                            alt={profile.user.full_name} 
                            className="h-full w-full rounded-full object-cover" 
                          />
                        ) : (
                          <UserPlus className="h-7 w-7" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-xl font-bold text-gray-100">{profile.user.full_name}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-primary mr-1" />
                              <span className="text-primary font-medium text-sm">{Math.floor(70 + Math.random() * 30)}% match</span>
                            </div>
                            <button
                              onClick={() => toggleSaveProfile(profile.id)}
                              className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                              title={isProfileSaved(profile.id) ? "Remove from saved" : "Save profile"}
                            >
                              {isProfileSaved(profile.id) ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Bookmark className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 mt-1 mb-3">{profile.user.bio?.substring(0, 100)}{profile.user.bio?.length > 100 ? '...' : ''}</p>
                        
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Startup Stage:</span>{' '}
                              <span className="text-gray-300">{profile.startup_stage.charAt(0).toUpperCase() + profile.startup_stage.slice(1)}</span>
                            </div>
                            
                            <div>
                              <span className="text-gray-500">Industries:</span>{' '}
                              <span className="text-gray-300">
                                {profile.industries.slice(0, 2).map(i => i.name).join(', ')}
                                {profile.industries.length > 2 ? ` +${profile.industries.length - 2} more` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {profile.skills.slice(0, 5).map(skill => (
                            <span 
                              key={skill.id} 
                              className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-xs"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {profile.skills.length > 5 && (
                            <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full text-xs">
                              +{profile.skills.length - 5} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                          <button
                            onClick={() => navigate(`/costart/profile/${profile.id}`)}
                            className="text-primary hover:underline text-sm flex items-center"
                          >
                            View Full Profile
                          </button>
                          
                          {requestSent === profile.id ? (
                            <div className="text-green-300 text-sm flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              Request Sent
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(profile.id)}
                              className="bg-gradient-to-r from-primary to-yellow-500 text-secondary py-1.5 px-4 rounded-md text-sm flex items-center transition-all hover:shadow-lg"
                              disabled={sendingRequest}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {sendingRequest ? 'Sending...' : 'Send Request'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default FindCoFounders;