
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface SaveTripButtonProps {
  className?: string;
}

const SaveTripButton: React.FC<SaveTripButtonProps> = ({ className }) => {
  const [saved, setSaved] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleSaveTrip = () => {
    setSaved(!saved);
    setAnimating(true);
    
    setTimeout(() => setAnimating(false), 1000);
    
    if (!saved) {
      toast.success('Trip saved to favorites!');
    } else {
      toast.info('Trip removed from favorites');
    }
  };

  return (
    <Button
      variant="outline"
      className={`relative group ${className}`}
      onClick={handleSaveTrip}
    >
      <Heart 
        className={`mr-2 ${saved ? 'fill-pink-500 text-pink-500' : ''} 
          transition-all duration-300 ${animating ? 'scale-150' : ''}`} 
      />
      {saved ? 'Saved' : 'Save Trip'}
      
      {animating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute animate-ping w-8 h-8 rounded-full bg-pink-400 opacity-30"></div>
        </div>
      )}
    </Button>
  );
};

export default SaveTripButton;
