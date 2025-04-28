
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, Plus, MapPin, Clock, IndianRupee, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Sample Indian attractions data
const attractionsData = [
  {
    id: 1,
    name: 'Taj Mahal',
    category: 'Monument',
    rating: 4.9,
    priceIndian: 50,
    priceForeigner: 1100,
    description: 'Iconic white marble mausoleum and UNESCO World Heritage Site built by Emperor Shah Jahan.',
    location: 'Agra, Uttar Pradesh',
    timings: '6:00 AM - 6:30 PM (Closed on Fridays)',
    image: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=800&h=500',
    culturalNote: 'Shoes must be removed or covered with shoe covers before entering the main mausoleum.'
  },
  {
    id: 2,
    name: 'Red Fort',
    category: 'Heritage',
    rating: 4.5,
    priceIndian: 35,
    priceForeigner: 600,
    description: 'Historic fort that served as the main residence of the Mughal Emperors for nearly 200 years.',
    location: 'Old Delhi, Delhi',
    timings: '9:30 AM - 4:30 PM (Closed on Mondays)',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=800&h=500',
    culturalNote: 'Light and sound show in the evenings portrays Mughal history.'
  },
  {
    id: 3,
    name: 'Golden Temple',
    category: 'Religious',
    rating: 4.9,
    priceIndian: 0,
    priceForeigner: 0,
    description: 'Holiest Gurdwara and most important pilgrimage site of Sikhism.',
    location: 'Amritsar, Punjab',
    timings: 'Open 24 hours',
    image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=800&h=500',
    culturalNote: 'Head covering is mandatory; modest dress required. Free community kitchen (langar) available.'
  },
  {
    id: 4,
    name: 'Gateway of India',
    category: 'Monument',
    rating: 4.6,
    priceIndian: 0,
    priceForeigner: 0,
    description: 'Iconic arch monument built during the British Raj, overlooking the Arabian Sea.',
    location: 'Mumbai, Maharashtra',
    timings: 'Open 24 hours',
    image: 'https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=800&h=500',
    culturalNote: 'Popular spot for sunset views and boat trips to Elephanta Caves.'
  },
  {
    id: 5,
    name: 'Meenakshi Temple',
    category: 'Religious',
    rating: 4.7,
    priceIndian: 0,
    priceForeigner: 100,
    description: 'Historic Hindu temple dedicated to goddess Meenakshi with stunning Dravidian architecture.',
    location: 'Madurai, Tamil Nadu',
    timings: '5:00 AM - 9:30 PM',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=800&h=500',
    culturalNote: 'Non-Hindus cannot enter certain inner sanctums. Dress modestly and remove footwear.'
  },
  {
    id: 6,
    name: 'Goa Beaches',
    category: 'Beach',
    rating: 4.4,
    priceIndian: 0,
    priceForeigner: 0,
    description: 'Beautiful coastal beaches with golden sands and vibrant beach shacks.',
    location: 'Goa',
    timings: 'Open 24 hours',
    image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=800&h=500',
    culturalNote: 'North Goa beaches are more lively, while South Goa offers more tranquility.'
  },
  {
    id: 7,
    name: 'Ajanta & Ellora Caves',
    category: 'Heritage',
    rating: 4.8,
    priceIndian: 40,
    priceForeigner: 600,
    description: 'Ancient rock-cut caves with elaborate paintings and carvings depicting Buddhist, Hindu and Jain art.',
    location: 'Aurangabad, Maharashtra',
    timings: '8:00 AM - 5:30 PM (Closed on Tuesdays)',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=800&h=500',
    culturalNote: 'Photography inside caves with paintings may be restricted.'
  },
  {
    id: 8,
    name: 'Jaipur City Palace',
    category: 'Palace',
    rating: 4.5,
    priceIndian: 200,
    priceForeigner: 700,
    description: 'Former royal residence with museums, courtyards, and beautiful architecture.',
    location: 'Jaipur, Rajasthan',
    timings: '9:30 AM - 5:00 PM',
    image: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=800&h=500',
    culturalNote: 'Audio guides available in multiple languages.'
  }
];

const AttractionsResults: React.FC = () => {
  const [savedAttractions, setSavedAttractions] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPricing, setShowPricing] = useState<'indian' | 'foreign'>('indian');
  const categories = ['all', ...new Set(attractionsData.map(attraction => attraction.category))];

  const handleSaveToggle = (id: number) => {
    setSavedAttractions(prev => 
      prev.includes(id) 
        ? prev.filter(savedId => savedId !== id)
        : [...prev, id]
    );
  };

  const handleAddToItinerary = (attraction: typeof attractionsData[0]) => {
    toast.success(`${attraction.name} added to itinerary!`);
  };

  const handleTogglePricing = () => {
    setShowPricing(prev => prev === 'indian' ? 'foreign' : 'indian');
  };

  // Filter attractions by category
  const filteredAttractions = activeCategory === 'all' 
    ? attractionsData 
    : attractionsData.filter(attraction => attraction.category === activeCategory);

  // Helper for rendering star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative w-3.5 h-3.5">
          <Star className="absolute w-3.5 h-3.5 text-yellow-400" />
          <div className="absolute overflow-hidden w-1.75 h-3.5">
            <Star className="absolute w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3.5 h-3.5 text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-y-3 gap-x-4">
        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button 
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Pricing toggle */}
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleTogglePricing}>
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {showPricing === 'indian' ? 'Indian pricing' : 'Foreign pricing'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Many tourist attractions in India have different pricing for Indian nationals and foreign visitors.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Attractions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAttractions.map((attraction) => (
          <Card key={attraction.id} className="overflow-hidden group hover:shadow-md transition-all duration-200">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={attraction.image} 
                alt={attraction.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => handleSaveToggle(attraction.id)}
              >
                <Heart className={`h-5 w-5 ${savedAttractions.includes(attraction.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
              </Button>
              <div className="absolute top-0 left-0 bg-black/70 text-white px-3 py-1 text-xs">
                {attraction.category}
              </div>
            </div>

            <CardContent className="p-4">
              <div className="mb-1">
                <h4 className="font-semibold line-clamp-1">{attraction.name}</h4>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {attraction.location}
                </div>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="flex">
                  {renderStars(attraction.rating)}
                </div>
                <span className="text-sm ml-1">{attraction.rating}</span>
              </div>
              
              <div className="flex items-center mb-2 text-xs">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{attraction.timings}</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{attraction.description}</p>
              
              {attraction.culturalNote && (
                <div className="mb-3 bg-amber-50 border border-amber-200 p-1.5 rounded-sm">
                  <div className="flex text-xs text-amber-700">
                    <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span className="line-clamp-2">{attraction.culturalNote}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-auto">
                <div>
                  {(showPricing === 'indian' ? attraction.priceIndian : attraction.priceForeigner) > 0 ? (
                    <div className="flex items-center">
                      <IndianRupee className="h-3 w-3 mr-0.5" />
                      <span className="font-medium">
                        {(showPricing === 'indian' ? attraction.priceIndian : attraction.priceForeigner).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {showPricing === 'indian' ? 'Indian' : 'Foreign'}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">Free entry</span>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  onClick={() => handleAddToItinerary(attraction)}
                  className="group-hover:bg-green-600 group-hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Itinerary
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AttractionsResults;
