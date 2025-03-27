import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we should show the signup form based on URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const showSignup = queryParams.get('signup');
    
    if (showSignup === 'true') {
      setIsLogin(false);
    }
  }, [location]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    bio: ''
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        // Handle login logic
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        // Successful login will trigger the useEffect to redirect
      } else {
        // Handle signup logic
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match!');
        }
        
        // Sign up with Supabase
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          bio: formData.bio
        });
        
        if (error) throw error;
        
        // Display a custom message about email confirmation
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
          statusMessage.innerHTML = '<strong>Account created successfully!</strong><br>Please check your email inbox to confirm your account.';
          statusMessage.className = 'p-4 mb-4 bg-green-500 bg-opacity-20 text-green-400 rounded-md border-l-4 border-green-500';
        }
        
        // Reset form and go back to login
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          bio: ''
        });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Render login form
  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-yellow-500 text-secondary py-2 px-4 rounded-md font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-70 transform hover:-translate-y-1"
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className="text-primary hover:text-opacity-80 transition-colors text-sm font-medium"
          disabled={loading}
        >
          Need an account? Sign up
        </button>
      </div>
    </form>
  );

  // Render signup form
  const renderSignupForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
            placeholder="John Doe"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
          Short Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-200"
          placeholder="Tell us about yourself..."
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-yellow-500 text-secondary py-2 px-4 rounded-md font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-70 transform hover:-translate-y-1"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className="text-primary hover:text-opacity-80 transition-colors text-sm font-medium"
          disabled={loading}
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-md mx-auto my-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">
          {isLogin ? 'Sign In to TechCombinator' : 'Create Your Account'}
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-primary to-yellow-500 rounded-full mx-auto mt-2"></div>
        <p className="text-gray-400 mt-4">
          {isLogin 
            ? 'Enter your credentials to access your account' 
            : 'Join our community of mentors and mentees'}
        </p>
      </div>

      <div className="bg-gray-900 bg-opacity-50 rounded-xl shadow-lg p-8 border border-gray-800">
        {/* Status message for displaying success notifications */}
        <div id="status-message" className="mb-4"></div>
        
        {error && (
          <div className="mb-4 bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-md flex items-start border-l-4 border-red-500">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {isLogin ? renderLoginForm() : renderSignupForm()}
      </div>
    </div>
  );
};

export default Auth;