
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      toast.success('यात्रा को पसंदीदा में सहेजा गया! (Trip saved to favorites!)');
    } else {
      toast.info('यात्रा को पसंदीदा से हटा दिया गया (Trip removed from favorites)');
    }
  };

  const shareViaWhatsApp = () => {
    const tripDetails = "Check out my amazing Indian travel itinerary planned with AI Travel Planner!";
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(tripDetails)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp पर साझा करने के लिए तैयार! (Ready to share on WhatsApp!)');
  };

  const downloadPDF = () => {
    toast.success('यात्रा PDF डाउनलोड हो रही है... (Trip PDF downloading...)');
    // In a real implementation, this would generate a PDF
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#'; // This would be a real PDF URL
      link.download = 'India-Travel-Itinerary.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="flex gap-2">
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={shareViaWhatsApp}>
            Share via WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadPDF}>
            Download PDF (Hindi/English)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SaveTripButton;
