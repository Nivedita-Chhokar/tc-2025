import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([false, false, false]);
  const [welcomeText, setWelcomeText] = useState('');
  const fullText = 'Connect with mentors, share knowledge, and grow together in our vibrant tech community';
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    // Trigger main animation
    setIsLoaded(true);
    
    // Hero section animation with slight delay
    setTimeout(() => {
      setIsHeroVisible(true);
    }, 300);
    
    // Staggered animation for cards
    cardsVisible.forEach((_, index) => {
      setTimeout(() => {
        setCardsVisible(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      }, 600 + (index * 200));
    });

    // Typewriter effect for welcome text
    if (charIndex < fullText.length) {
      const typingTimer = setTimeout(() => {
        setWelcomeText(fullText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 30); // Adjust typing speed here
      
      return () => clearTimeout(typingTimer);
    }
  }, [charIndex]);

  const handleGetStarted = () => {
    // Navigate to auth page with a query parameter to show signup form
    navigate('/auth?signup=true');
  };

  return (
    <div className={`space-y-12 transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`}>
      <section className={`relative overflow-hidden py-16 px-6 text-center rounded-xl bg-gray-900 bg-opacity-50 text-white shadow-xl border border-gray-800 transition-all duration-700 ease-out ${
        isHeroVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
      }`}>
        {/* Decorative elements with animation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" style={{ animationDelay: "1s" }}></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400 animate-gradientShift">
            Welcome to TechCombinator
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300 min-h-[3.5rem]">
            {welcomeText}
            <span className="animate-blink">|</span>
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-primary to-yellow-500 text-secondary px-6 py-3 rounded-md font-semibold flex items-center mx-auto hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 animate-bounce"
            style={{ animationDuration: "2s", animationIterationCount: "3" }}
          >
            Get Started <ArrowRight className="ml-2 animate-pulse" />
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Upcoming Events",
            description: "Check out our latest events and workshops to enhance your skills and network with professionals."
          },
          {
            title: "Latest Announcements",
            description: "Stay updated with important news, community highlights, and upcoming opportunities."
          },
          {
            title: "Featured Mentors",
            description: "Connect with industry experts who can guide you through your professional development journey."
          }
        ].map((card, index) => (
          <div 
            key={index}
            className={`bg-gray-900 bg-opacity-50 p-6 rounded-lg shadow-lg border border-gray-800 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:border-primary/30 ${
              cardsVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="bg-black bg-opacity-40 p-3 inline-block rounded-lg mb-3 transition-all duration-300 hover:bg-opacity-60">
              <h2 className="text-xl font-bold mb-1 text-white">{card.title}</h2>
              <div className="h-1 w-0 bg-gradient-to-r from-primary to-yellow-500 rounded-full group-hover:w-full transition-all duration-500 hover:w-full"></div>
            </div>
            <p className="text-gray-300">{card.description}</p>
            
            {/* Animated corner accent */}
            <div className="w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent border-r-primary/20 absolute bottom-0 right-0 transition-all duration-300 opacity-0 hover:opacity-100"></div>
          </div>
        ))}
      </section>
    </div>
  );
};

// Add these keyframes animations to your global CSS
const CSSKeyframes = `
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.animate-gradientShift {
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
}

.animate-blink {
  animation: blink 1s step-end infinite;
}
`;

export default Home;