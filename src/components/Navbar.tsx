import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell, BookOpen, User, Users } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
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
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
              <span className="hidden md:inline">Profile</span>
            </Link>
            <Link 
              to="/auth" 
              className="bg-primary text-secondary px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;