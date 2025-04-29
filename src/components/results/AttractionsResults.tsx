
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, Plus, MapPin, Clock, IndianRupee, Info, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { fetchAttractions, AttractionResult } from '@/utils/api';
import { Skeleton } from '@/components/ui/skeleton';

const AttractionsResults: React.FC = () => {
  const [savedAttractions, setSavedAttractions] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPricing, setShowPricing] = useState<'indian' | 'foreign'>('indian');
  const [attractions, setAttractions] = useState<AttractionResult[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttractions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve search params from session storage or use defaults
        const searchData = sessionStorage.getItem('travelSearchData');
        let destination = 'New Delhi';

        if (searchData) {
          const parsedData = JSON.parse(searchData);
          destination = parsedData.destination || destination;
        }

        // Fetch attractions
        const attractionsData = await fetchAttractions({
          destination
        });

        setAttractions(attractionsData);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(attractionsData.map(attraction => attraction.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching attractions:', err);
        setError('Failed to load attraction data. Please try again later.');
        toast.error('Could not load attraction data');
      } finally {
        setLoading(false);
      }
    };

    loadAttractions();
  }, []);

  const handleSaveToggle = (id: number) => {
    setSavedAttractions(prev => 
      prev.includes(id) 
        ? prev.filter(savedId => savedId !== id)
        : [...prev, id]
    );

    if (!savedAttractions.includes(id)) {
      toast.success('Attraction saved to favorites!');
    }
  };

  const handleAddToItinerary = (attraction: AttractionResult) => {
    toast.success(`${attraction.name} added to itinerary!`);
  };

  const handleTogglePricing = () => {
    setShowPricing(prev => prev === 'indian' ? 'foreign' : 'indian');
  };

  // Filter attractions by category
  const filteredAttractions = activeCategory === 'all' 
    ? attractions 
    : attractions.filter(attraction => attraction.category === activeCategory);

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

  // Loading skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-y-3 gap-x-4 mb-4">
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
          
          <Skeleton className="h-9 w-40" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

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

      {filteredAttractions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No attractions found in the selected category.</p>
          {activeCategory !== 'all' && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setActiveCategory('all')}
            >
              Show All Attractions
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttractions.map((attraction) => (
            <Card key={attraction.id} className="overflow-hidden group hover:shadow-md transition-all duration-200">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={attraction.image} 
                  alt={attraction.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Attraction';
                  }}
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
      )}
    </div>
  );
};

export default AttractionsResults;
