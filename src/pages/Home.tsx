import React from 'react';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-secondary rounded-lg text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to TechCombinator</h1>
        <p className="text-xl mb-8">Connect with mentors, share knowledge, and grow together</p>
        <button className="bg-primary text-secondary px-6 py-3 rounded-md font-semibold flex items-center mx-auto hover:bg-opacity-90 transition-colors">
          Get Started <ArrowRight className="ml-2" />
        </button>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-gray-600">Check out our latest events and workshops</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
          <h2 className="text-xl font-bold mb-4">Latest Announcements</h2>
          <p className="text-gray-600">Stay updated with important news</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
          <h2 className="text-xl font-bold mb-4">Featured Mentors</h2>
          <p className="text-gray-600">Connect with industry experts</p>
        </div>
      </section>
    </div>
  );
};

export default Home;