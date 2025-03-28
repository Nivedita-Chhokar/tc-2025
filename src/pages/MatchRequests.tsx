// src/pages/MatchRequests.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, UserCheck, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { cofounderService } from '../services/cofounderService';
import { MatchStatus } from '../types/cofounder';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import ConfirmDialog from '../components/ConfirmDialog';

interface MatchRequest {
  id: string;
  founder_id: string;
  founder_profile: {
    id: string;
    user_id: string;
    skills: any[];
    industries: any[];
    startup_stage: string;
    work_style: any[];
    user: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  };
  status: string;
  created_at: string;
}

const MatchRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [viewType, setViewType] = useState<'received' | 'sent'>('received');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MatchRequest | null>(null);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [received, sent] = await Promise.all([
        cofounderService.getReceivedMatchRequests(user.id),
        cofounderService.getSentMatchRequests(user.id),
      ]);
      
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (err) {
      console.error('Error loading match requests:', err);
      setError('Error loading requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleOpenAcceptDialog = (request: MatchRequest) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const handleOpenRejectDialog = (request: MatchRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    
    setProcessingId(selectedRequest.id);
    setShowAcceptDialog(false);
    
    try {
      await cofounderService.updateMatchStatus(selectedRequest.id, MatchStatus.ACCEPTED);
      
      // Update the local state
      setReceivedRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: MatchStatus.ACCEPTED } 
            : req
        )
      );
      
      setStatusMessage({
        text: 'Match request accepted! You can now start collaborating.',
        type: 'success'
      });
    } catch (err) {
      console.error('Error accepting match request:', err);
      setStatusMessage({
        text: 'Error accepting request. Please try again.',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    setProcessingId(selectedRequest.id);
    setShowRejectDialog(false);
    
    try {
      await cofounderService.updateMatchStatus(selectedRequest.id, MatchStatus.REJECTED);
      
      // Update the local state
      setReceivedRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: MatchStatus.REJECTED } 
            : req
        )
      );
      
      setStatusMessage({
        text: 'Match request declined.',
        type: 'success'
      });
    } catch (err) {
      console.error('Error rejecting match request:', err);
      setStatusMessage({
        text: 'Error declining request. Please try again.',
        type: 'error'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getFilteredRequests = () => {
    const requests = viewType === 'received' ? receivedRequests : sentRequests;
    
    if (activeTab === 'pending') {
      return requests.filter(req => req.status === MatchStatus.PENDING);
    }
    
    return requests;
  };

  const filteredRequests = getFilteredRequests();

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
        {/* Accept Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showAcceptDialog}
          title="Accept Match Request"
          message={selectedRequest ? `Accept match request from ${selectedRequest.founder_profile.user.full_name}?` : ''}
          confirmText="Accept"
          cancelText="Cancel"
          onConfirm={handleAcceptRequest}
          onCancel={() => setShowAcceptDialog(false)}
          variant="info"
        />
        
        {/* Reject Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showRejectDialog}
          title="Decline Match Request"
          message={selectedRequest ? `Decline match request from ${selectedRequest.founder_profile.user.full_name}?` : ''}
          confirmText="Decline"
          cancelText="Cancel"
          onConfirm={handleRejectRequest}
          onCancel={() => setShowRejectDialog(false)}
          variant="warning"
        />
        
        <Link to="/costart" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Co-Start
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">Match Requests</h1>
          <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full mt-1"></div>
          <p className="mt-2 text-gray-300">
            Manage your co-founder match requests
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md shadow border-l-4 border-red-500 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status message */}
        {statusMessage && (
          <div className={`p-4 rounded-md flex items-center ${
            statusMessage.type === 'success' 
              ? 'bg-green-900 bg-opacity-50 text-green-300 border-l-4 border-green-500' 
              : 'bg-red-900 bg-opacity-50 text-red-300 border-l-4 border-red-500'
          }`}>
            {statusMessage.type === 'success' ? (
              <ThumbsUp className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg overflow-hidden border border-gray-800">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-700">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                viewType === 'received' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setViewType('received')}
            >
              Received Requests
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                viewType === 'sent' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setViewType('sent')}
            >
              Sent Requests
            </button>
          </div>
          
          {/* Filter by status */}
          <div className="p-4 bg-gray-800 border-b border-gray-700 flex space-x-2">
            <button
              className={`px-4 py-1 text-sm rounded-full ${
                activeTab === 'pending' 
                  ? 'bg-primary text-gray-900' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </button>
            <button
              className={`px-4 py-1 text-sm rounded-full ${
                activeTab === 'all' 
                  ? 'bg-primary text-gray-900' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Requests
            </button>
          </div>
          
          {/* Requests list */}
          <div className="divide-y divide-gray-700">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center">
                <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <h3 className="text-lg font-medium text-gray-300 mb-1">No {activeTab === 'pending' ? 'pending' : ''} requests</h3>
                <p className="text-gray-400">
                  {viewType === 'received' 
                    ? 'You don\'t have any incoming match requests at the moment.' 
                    : 'You haven\'t sent any match requests yet.'}
                </p>
              </div>
            ) : (
              filteredRequests.map(request => (
                <div key={request.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700 mr-4">
                        {request.founder_profile.user.avatar_url ? (
                          <img 
                            src={request.founder_profile.user.avatar_url} 
                            alt={request.founder_profile.user.full_name} 
                            className="h-full w-full rounded-full object-cover" 
                          />
                        ) : (
                          <UserCheck className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-200">{request.founder_profile.user.full_name}</h3>
                        <div className="flex items-center text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            request.status === MatchStatus.PENDING 
                              ? 'bg-yellow-900 text-yellow-300' 
                              : request.status === MatchStatus.ACCEPTED 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className="text-gray-500 mx-2">•</span>
                          <Link 
                            to={`/costart/profile/${request.founder_profile.id}`}
                            className="text-primary hover:underline flex items-center"
                          >
                            View Profile <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {viewType === 'received' && request.status === MatchStatus.PENDING && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenAcceptDialog(request)}
                          disabled={processingId === request.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm flex items-center disabled:opacity-50"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleOpenRejectDialog(request)}
                          disabled={processingId === request.id}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-3 rounded-md text-sm flex items-center disabled:opacity-50"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Decline
                        </button>
                      </div>
                    )}
                    
                    {viewType === 'sent' && request.status === MatchStatus.ACCEPTED && (
                      <Link
                        to={`/costart/matches`}
                        className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm flex items-center"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MatchRequests;