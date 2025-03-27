import React, { useState } from 'react';
import { Mail, Lock, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        
        // If signup successful, show a message and redirect to login
        alert('Account created successfully! Please check your email for confirmation.');
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-secondary py-2 px-4 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className="text-primary hover:text-opacity-80 transition-colors text-sm"
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="John Doe"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Short Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Tell us about yourself..."
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-secondary py-2 px-4 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className="text-primary hover:text-opacity-80 transition-colors text-sm"
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
        <h1 className="text-3xl font-bold text-gray-900">
          {isLogin ? 'Sign In to TechCombinator' : 'Create Your Account'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isLogin 
            ? 'Enter your credentials to access your account' 
            : 'Join our community of mentors and mentees'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md flex items-start">
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