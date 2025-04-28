
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Content */}
      <div className="container-custom relative z-10 text-center text-white pt-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Plan Your Perfect Trip in Minutes
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Find the best flights, hotels, and attractions all in one place
          </p>
          <Button 
            className="bg-travel-green hover:bg-travel-darkBlue text-white px-8 py-6 text-lg animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            Plan Your Trip Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
