
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    )}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center">
          <span className={cn(
            'text-2xl font-bold transition-colors', 
            isScrolled ? 'text-travel-blue' : 'text-white'
          )}>
            AI Travel Planner
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {['Home', 'Features', 'How it Works', 'Contact'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className={cn(
                'font-medium hover:text-travel-blue transition-colors',
                isScrolled ? 'text-gray-700' : 'text-white'
              )}
            >
              {item}
            </a>
          ))}
          <Button className="bg-travel-green hover:bg-travel-darkBlue transition-colors">
            Get Started
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X 
              className={cn(
                'h-6 w-6 transition-colors',
                isScrolled ? 'text-gray-900' : 'text-white'
              )} 
            />
          ) : (
            <Menu 
              className={cn(
                'h-6 w-6 transition-colors',
                isScrolled ? 'text-gray-900' : 'text-white'
              )} 
            />
          )}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden">
            <nav className="flex flex-col py-4">
              {['Home', 'Features', 'How it Works', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-6 py-3 font-medium text-gray-700 hover:bg-gray-100 hover:text-travel-blue"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="px-6 py-4">
                <Button className="w-full bg-travel-green hover:bg-travel-darkBlue">
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
