
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Sample attractions data
const attractionsData = [
  {
    id: 1,
    name: 'Hollywood Walk of Fame',
    category: 'Landmark',
    rating: 4.2,
    price: 0,
    description: 'Iconic sidewalk embedded with more than 2,700 stars featuring the names of celebrities.',
    image: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=800&h=500'
  },
  {
    id: 2,
    name: 'Universal Studios Hollywood',
    category: 'Theme Park',
    rating: 4.7,
    price: 129,
    description: 'Movie-themed amusement park with thrilling rides, shows and behind-the-scenes tours.',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=800&h=500'
  },
  {
    id: 3,
    name: 'Santa Monica Pier',
    category: 'Landmark',
    rating: 4.5,
    price: 0,
    description: 'Historic pier with an amusement park, aquarium, shops, restaurants and stunning ocean views.',
    image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=800&h=500'
  },
  {
    id: 4,
    name: 'Griffith Observatory',
    category: 'Museum',
    rating: 4.8,
    price: 0,
    description: 'Observatory with telescopes, planetarium shows, exhibits and panoramic views of LA.',
    image: 'https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=800&h=500'
  },
  {
    id: 5,
    name: 'The Getty Center',
    category: 'Museum',
    rating: 4.6,
    price: 0,
    description: 'Art museum with European paintings, drawings, sculptures and decorative arts.',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=800&h=500'
  },
  {
    id: 6,
    name: 'Venice Beach Boardwalk',
    category: 'Beach',
    rating: 4.3,
    price: 0,
    description: 'Colorful boardwalk known for street performers, vendors, and quirky atmosphere.',
    image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=800&h=500'
  }
];

const AttractionsResults: React.FC = () => {
  const [savedAttractions, setSavedAttractions] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
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
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold">{attraction.name}</h4>
                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{attraction.category}</span>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="flex">
                  {renderStars(attraction.rating)}
                </div>
                <span className="text-sm ml-1">{attraction.rating}</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{attraction.description}</p>
              
              <div className="flex justify-between items-center mt-auto">
                <div>
                  {attraction.price > 0 ? (
                    <span className="font-medium">${attraction.price}</span>
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
