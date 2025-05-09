import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Map, Plane } from "lucide-react";

const Hero = () => {
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };

    window.addEventListener("scroll", handleScroll);
    setIsVisible(true);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with parallax and gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2000')`,
          transform: `translateY(${offset * 0.2}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-blue-900/60 to-teal-800/70"></div>

      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-2/3 left-1/2 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/5 text-white/30 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "0.3s" }}
        >
          <Plane size={40} className="animate-float" />
        </div>
        <div
          className={`absolute bottom-1/3 right-1/6 text-white/30 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "0.6s" }}
        >
          <Map size={48} className="animate-float-delayed" />
        </div>
        <div
          className={`absolute top-2/3 left-1/6 text-white/30 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "0.9s" }}
        >
          <Compass size={36} className="animate-float-reverse" />
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 relative z-10 text-center text-white py-20">
        <div className="max-w-3xl mx-auto">
          <div
            className={`transform transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 border border-white/20">
              Discover the world with AI-powered planning
            </span>
          </div>

          <h1
            className={`text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-up ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-teal-200">
              Plan Your Perfect Trip
            </span>
            <span className="block mt-2">in Minutes</span>
          </h1>

          <p
            className={`text-xl md:text-2xl mb-8 text-blue-100/90 animate-fade-up ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "0.4s" }}
          >
            Find the best flights, hotels, and attractions all in one place with
            our intelligent travel planner
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "0.6s" }}
          >
            <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 border-none text-white px-8 py-6 text-lg rounded-full group relative overflow-hidden transition-all duration-300 shadow-lg hover:shadow-teal-500/20">
              <span className="relative z-10 flex items-center group-hover:translate-x-1 transition-transform">
                Plan Your Trip Now <ArrowRight className="ml-2 w-5 h-5" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Button>

            <Button
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg rounded-full transition-all duration-300"
            >
              Learn More
            </Button>
          </div>

          {/* Scrolling indicator */}
          <div
            className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "1s" }}
          >
            <div className="animate-bounce flex flex-col items-center">
              <span className="text-sm text-blue-100/70 mb-2">
                Scroll to explore
              </span>
              <div className="w-6 h-10 rounded-full border-2 border-blue-100/30 flex justify-center pt-1">
                <div className="w-1 h-2 bg-blue-100/50 rounded-full animate-scroll"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
