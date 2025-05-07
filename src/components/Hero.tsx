
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000')`,
        backgroundPosition: `center ${offset * 0.5}px`,
        backgroundSize: 'cover'
      }}
    >
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
      
      {/* Content */}
      <div className="container-custom relative z-10 text-center text-white pt-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Your Dream Journey <br />Planned Intelligently
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Discover personalized travel experiences tailored just for you
          </p>
          <div className="space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              className="bg-travel-green hover:bg-travel-darkBlue text-white px-8 py-6 text-lg group"
            >
              Plan Your Trip Now 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white/20 px-8 py-6 text-lg"
            >
              Explore Destinations
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,96L48,85.3C96,75,192,53,288,58.7C384,64,480,96,576,96C672,96,768,64,864,58.7C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
