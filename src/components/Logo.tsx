
import React from 'react';

interface LogoProps {
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ variant = 'default', size = 'md' }) => {
  // Size mappings
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  // Color mappings
  const colorClasses = {
    default: 'text-travel-blue',
    light: 'text-white',
  };
  
  return (
    <div className="flex items-center">
      <svg 
        className={`${sizeClasses[size]} ${colorClasses[variant]}`} 
        viewBox="0 0 120 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Globe/Compass circle */}
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
        
        {/* Compass needle */}
        <path d="M20 8L23 20H17L20 8Z" fill="currentColor" />
        <path d="M20 32L17 20H23L20 32Z" fill="currentColor" />
        
        {/* Airplane path */}
        <path 
          d="M55 16C58 14 63 12 69 15C75 18 78 23 85 23C92 23 95 20 95 20" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M85 23L90 18M85 23L90 28" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Small airplane icon */}
        <path 
          d="M55 16L45 20L42 19V17L45 18L55 16Z" 
          fill="currentColor"
        />
        <path 
          d="M46 17L46 12L48 12L48 18L46 17Z" 
          fill="currentColor"
        />
      </svg>
      
      <span className={`font-bold ml-2 ${sizeClasses[size]} ${colorClasses[variant]} whitespace-nowrap`}>
        AI Travel Planner
      </span>
    </div>
  );
};

export default Logo;
