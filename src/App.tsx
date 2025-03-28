import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Announcements from './pages/Announcements';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import CreateBlogPost from './pages/CreateBlogPost';
import EditBlogPost from './pages/EditBlogPost';
import Profile from './pages/Profile';
import Mentors from './pages/Mentors';
import Auth from './pages/Auth';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CoStart from './pages/CoStart';
import CreateFounderProfile from './pages/CreateFounderProfile';
import EditFounderProfile from './pages/EditFounderProfile';
import FindCoFounders from './pages/FindCoFounders';
import ViewFounderProfile from './pages/ViewFounderProfile';
import MatchRequests from './pages/MatchRequests';
import Matches from './pages/Matches';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-gray-100">
          <Navbar />
          {/* Main content container with max-width and centering */}
          <main className="mx-auto w-full max-w-[80%] px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/announcements" element={<Announcements />} />
              
              {/* Blog routes */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/blog/new" element={<CreateBlogPost />} />
              <Route path="/blog/edit/:id" element={<EditBlogPost />} />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/auth" element={<Auth />} />
              {/* Co-Start routes */}
              <Route 
                path="/costart" 
                element={
                  <ProtectedRoute>
                    <CoStart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/costart/profile/create" 
                element={<CreateFounderProfile />} 
              />
              <Route 
                path="/costart/profile/edit" 
                element={<EditFounderProfile />} 
              />
              <Route 
                path="/costart/find" 
                element={<FindCoFounders />} 
              />
              <Route 
                path="/costart/profile/:id" 
                element={<ViewFounderProfile />} 
              />
              <Route 
                path="/costart/requests" 
                element={<MatchRequests />} 
              />
              <Route 
                path="/costart/matches" 
                element={<Matches />} 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;