import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Announcements from './pages/Announcements';
import Blog from './pages/Blog';
import Profile from './pages/Profile';
import Mentors from './pages/Mentors';
import Auth from './pages/Auth';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/blog" element={<Blog />} />
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
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;