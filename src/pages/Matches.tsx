// src/pages/Matches.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MessageSquare, Calendar, FileSpreadsheet, CheckSquare, BookOpen, Phone, VideoIcon, Mail, Image } from 'lucide-react';
import { cofounderService } from '../services/cofounderService';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { format } from 'date-fns';

interface MatchedFounder {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  skills: string[];
  matchDate: string;
}

const Matches = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchedFounder[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchedFounder | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'tasks' | 'meetings'>('chat');
  
  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const matchesData = await cofounderService.getAcceptedMatches(user.id);
        
        // Transform data for UI
        const formattedMatches: MatchedFounder[] = matchesData.map(match => {
          // Determine which party is the match (not the current user)
          const isFounder = match.founder_profile.user_id !== user.id;
          const matchProfile = isFounder 
            ? match.founder_profile 
            : match.matched_founder_profile;
          
          return {
            id: matchProfile.id,
            name: matchProfile.user.full_name,
            avatar_url: matchProfile.user.avatar_url,
            bio: matchProfile.user.bio,
            skills: matchProfile.skills.map((skill: any) => skill.name),
            matchDate: match.updated_at
          };
        });
        
        setMatches(formattedMatches);
        
        // Select first match by default if available
        if (formattedMatches.length > 0) {
          setSelectedMatch(formattedMatches[0]);
        }
      } catch (err) {
        console.error('Error loading matches:', err);
        setError('Error loading your matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const handleSelectMatch = (match: MatchedFounder) => {
    setSelectedMatch(match);
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
        
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Your Matches</h1>
          <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1"></div>
          <p className="mt-2 text-gray-300">
            Collaborate with your co-founder matches
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md shadow border-l-4 border-red-500 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg p-8 border border-gray-800 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">No Matches Yet</h2>
            <p className="text-gray-300 mb-6">
              You don't have any accepted matches yet. Browse potential co-founders or check your pending match requests.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/costart/find"
                className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-5 py-2 rounded-md font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Find Co-Founders
              </Link>
              <Link
                to="/costart/requests"
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-md font-medium transition-colors"
              >
                View Requests
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Matches sidebar */}
            <div className="bg-gray-900 bg-opacity-50 rounded-xl overflow-hidden border border-gray-800">
              <div className="p-4 bg-gray-800 border-b border-gray-700">
                <h2 className="font-semibold text-gray-200">Your Co-Founders</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {matches.map(match => (
                  <button
                    key={match.id}
                    className={`w-full text-left p-4 flex items-center hover:bg-gray-800 transition-colors ${
                      selectedMatch?.id === match.id ? 'bg-gray-800' : ''
                    }`}
                    onClick={() => handleSelectMatch(match)}
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700 mr-3">
                      {match.avatar_url ? (
                        <img 
                          src={match.avatar_url} 
                          alt={match.name} 
                          className="h-full w-full rounded-full object-cover" 
                        />
                      ) : (
                        <MessageSquare className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-200">{match.name}</h3>
                      <p className="text-xs text-gray-400">
                        Matched {format(new Date(match.matchDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Collaboration area */}
            {selectedMatch && (
              <div className="md:col-span-3 bg-gray-900 bg-opacity-50 rounded-xl overflow-hidden border border-gray-800">
                {/* Header with profile info */}
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700 mr-4">
                      {selectedMatch.avatar_url ? (
                        <img 
                          src={selectedMatch.avatar_url} 
                          alt={selectedMatch.name} 
                          className="h-full w-full rounded-full object-cover" 
                        />
                      ) : (
                        <MessageSquare className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-100">{selectedMatch.name}</h2>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMatch.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index} 
                            className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {selectedMatch.skills.length > 3 && (
                          <span className="text-gray-400 text-xs px-1">
                            +{selectedMatch.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-primary hover:bg-gray-700 transition-colors">
                      <Mail className="h-5 w-5" />
                    </button>
                    <button className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-primary hover:bg-gray-700 transition-colors">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-primary hover:bg-gray-700 transition-colors">
                      <VideoIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Collaboration tabs */}
                <div className="border-b border-gray-700">
                  <div className="flex overflow-x-auto">
                    <button
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                        activeTab === 'chat' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('chat')}
                    >
                      <MessageSquare className="h-4 w-4 inline mr-1" />
                      Chat
                    </button>
                    <button
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                        activeTab === 'documents' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('documents')}
                    >
                      <FileSpreadsheet className="h-4 w-4 inline mr-1" />
                      Documents
                    </button>
                    <button
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                        activeTab === 'tasks' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('tasks')}
                    >
                      <CheckSquare className="h-4 w-4 inline mr-1" />
                      Tasks
                    </button>
                    <button
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                        activeTab === 'meetings' 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('meetings')}
                    >
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Meetings
                    </button>
                  </div>
                </div>
                
                {/* Collaboration content based on active tab */}
                <div className="p-6">
                  {activeTab === 'chat' && (
                    <div className="flex flex-col h-96">
                      <div className="flex-1 overflow-y-auto p-4 bg-gray-800 bg-opacity-50 rounded-md mb-4">
                        <div className="text-center py-10">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                          <h3 className="text-lg font-medium text-gray-300 mb-1">Start a conversation</h3>
                          <p className="text-gray-400 mb-6">
                            Send a message to {selectedMatch.name} to start collaborating
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <input 
                          type="text" 
                          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
                          placeholder="Type a message..."
                        />
                        <button className="bg-primary text-gray-900 px-4 py-2 rounded-r-md font-medium hover:bg-yellow-500 transition-colors">
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'documents' && (
                    <div className="text-center py-10">
                      <FileSpreadsheet className="h-16 w-16 mx-auto mb-2 text-gray-500" />
                      <h3 className="text-lg font-medium text-gray-300 mb-1">No shared documents yet</h3>
                      <p className="text-gray-400 mb-6">
                        Upload or create documents to share with {selectedMatch.name}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-4 py-2 rounded-md flex items-center font-medium hover:shadow-lg transition-all duration-300">
                          <Image className="h-4 w-4 mr-2" />
                          Upload File
                        </button>
                        <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md flex items-center font-medium transition-colors">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Create New
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'tasks' && (
                    <div className="text-center py-10">
                      <CheckSquare className="h-16 w-16 mx-auto mb-2 text-gray-500" />
                      <h3 className="text-lg font-medium text-gray-300 mb-1">No tasks created yet</h3>
                      <p className="text-gray-400 mb-6">
                        Create tasks to track your startup progress with {selectedMatch.name}
                      </p>
                      <button className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-4 py-2 rounded-md flex items-center font-medium hover:shadow-lg transition-all duration-300 mx-auto">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Create Task Board
                      </button>
                    </div>
                  )}
                  
                  {activeTab === 'meetings' && (
                    <div className="text-center py-10">
                      <Calendar className="h-16 w-16 mx-auto mb-2 text-gray-500" />
                      <h3 className="text-lg font-medium text-gray-300 mb-1">No scheduled meetings</h3>
                      <p className="text-gray-400 mb-6">
                        Schedule a meeting with {selectedMatch.name} to discuss your startup
                      </p>
                      <button className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-4 py-2 rounded-md flex items-center font-medium hover:shadow-lg transition-all duration-300 mx-auto">
                        <VideoIcon className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Matches;
