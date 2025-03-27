import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to auth page with a query parameter to show signup form
    navigate('/auth?signup=true');
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden py-16 px-6 text-center rounded-xl bg-gray-900 bg-opacity-50 text-white shadow-xl border border-gray-800">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">
          Welcome to TechCombinator
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
          Connect with mentors, share knowledge, and grow together in our vibrant tech community
        </p>
        <button 
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-6 py-3 rounded-md font-semibold flex items-center mx-auto hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Get Started <ArrowRight className="ml-2" />
        </button>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg border border-gray-800 hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
          <div className="bg-black bg-opacity-40 p-3 inline-block rounded-lg mb-3">
            <h2 className="text-xl font-bold mb-1 text-white">Upcoming Events</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full"></div>
          </div>
          <p className="text-gray-300">Check out our latest events and workshops to enhance your skills and network with professionals.</p>
        </div>

        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg border border-gray-800 hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
          <div className="bg-black bg-opacity-40 p-3 inline-block rounded-lg mb-3">
            <h2 className="text-xl font-bold mb-1 text-white">Latest Announcements</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full"></div>
          </div>
          <p className="text-gray-300">Stay updated with important news, community highlights, and upcoming opportunities.</p>
        </div>

        <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg border border-gray-800 hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
          <div className="bg-black bg-opacity-40 p-3 inline-block rounded-lg mb-3">
            <h2 className="text-xl font-bold mb-1 text-white">Featured Mentors</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-yellow-500 rounded-full"></div>
          </div>
          <p className="text-gray-300">Connect with industry experts who can guide you through your professional development journey.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;