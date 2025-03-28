import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell, BookOpen, User, Users, LogOut, } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg border-b border-gray-800">
      <div className="mx-auto w-full max-w-[80%] px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-primary to-yellow-500 p-2 rounded-full shadow-md">
              <Users className="h-6 w-6 text-gray-900" />
            </div>
            <span className="text-xl font-bold">TechCombinator</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/calendar" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </Link>
            <Link to="/announcements" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span>Announcements</span>
            </Link>
            <Link to="/blog" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <BookOpen className="h-5 w-5" />
              <span>Blog</span>
            </Link>
            <Link to="/mentors" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <Users className="h-5 w-5" />
              <span>Mentors</span>
            </Link>
            <Link to="/costart" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <Users className="h-5 w-5" />
              <span>Co-Start</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Profile</span>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="bg-gradient-to-r from-primary to-yellow-500 text-gray-900 px-4 py-2 rounded-md font-medium hover:opacity-90 transition-colors shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;