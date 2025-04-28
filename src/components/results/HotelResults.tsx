
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Star, Wifi, MapPin, Heart, Car, Coffee } from 'lucide-react';

// Sample hotel data
const hotelData = [
  {
    id: 1,
    name: 'Grand Plaza Hotel',
    rating: 4.5,
    price: 189,
    address: '123 Main Street, Downtown',
    amenities: ['wifi', 'parking', 'breakfast'],
    description: 'Luxury hotel in the heart of downtown with stunning city views.',
    images: [
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=600&h=400'
    ]
  },
  {
    id: 2,
    name: 'Oceanview Resort & Spa',
    rating: 5,
    price: 279,
    address: '500 Beachfront Avenue, Coastal District',
    amenities: ['wifi', 'parking', 'breakfast', 'spa'],
    description: 'Premium beachfront resort with full-service spa and ocean views.',
    images: [
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400'
    ]
  },
  {
    id: 3,
    name: 'Mountain Retreat Lodge',
    rating: 4,
    price: 159,
    address: '768 Alpine Road, Mountain View',
    amenities: ['wifi', 'parking'],
    description: 'Cozy mountain lodge with breathtaking nature views and hiking trails.',
    images: [
      'https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400'
    ]
  }
];

const HotelResults: React.FC = () => {
  const [priceRange, setPriceRange] = useState<number[]>([100, 300]);
  const [starFilter, setStarFilter] = useState('all');
  const [savedHotels, setSavedHotels] = useState<number[]>([]);

  const handleSaveToggle = (hotelId: number) => {
    setSavedHotels(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  // Filter hotels
  const filteredHotels = hotelData.filter(hotel => {
    const matchesPrice = hotel.price >= priceRange[0] && hotel.price <= priceRange[1];
    const matchesStars = starFilter === 'all' || 
      (starFilter === '3plus' && hotel.rating >= 3) ||
      (starFilter === '4plus' && hotel.rating >= 4) ||
      (starFilter === '5only' && hotel.rating === 5);
    
    return matchesPrice && matchesStars;
  });

  // Helper for rendering amenity icons
  const getAmenityIcon = (amenity: string) => {
    switch(amenity) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'parking': return <Car className="h-4 w-4" />;
      case 'breakfast': return <Coffee className="h-4 w-4" />;
      default: return null;
    }
  };

  // Helper for rendering star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative w-4 h-4">
          <Star className="absolute w-4 h-4 text-yellow-400" />
          <div className="absolute overflow-hidden w-2 h-4">
            <Star className="absolute w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }
    
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        {/* Price range filter */}
        <div className="space-y-2 w-full md:w-64">
          <label className="text-sm font-medium">Price range ($)</label>
          <Slider 
            min={50} 
            max={500} 
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Star rating filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Star Rating</label>
          <Select value={starFilter} onValueChange={setStarFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="3plus">3+ Stars</SelectItem>
              <SelectItem value="4plus">4+ Stars</SelectItem>
              <SelectItem value="5only">5 Stars Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredHotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden hover:shadow-md transition-all duration-200">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-2">
                {/* Hotel image carousel */}
                <div className="md:col-span-1">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {hotel.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="h-52 md:h-full min-h-40 relative">
                            <img 
                              src={image} 
                              alt={`${hotel.name} - image ${index+1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                </div>
                
                {/* Hotel details */}
                <div className="p-4 md:col-span-2">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-xl font-bold">{hotel.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleSaveToggle(hotel.id)}
                      className="relative"
                    >
                      <Heart className={`h-5 w-5 ${savedHotels.includes(hotel.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                      {savedHotels.includes(hotel.id) && 
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                        </span>
                      }
                    </Button>
                  </div>

                  <div className="flex mb-2">
                    {renderStars(hotel.rating)}
                    <span className="text-sm ml-2">{hotel.rating} stars</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.address}
                  </div>
                  
                  <p className="text-sm mb-4">{hotel.description}</p>
                  
                  <div className="flex gap-2 mb-4">
                    {hotel.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center bg-muted px-2 py-1 rounded text-xs">
                        {getAmenityIcon(amenity)}
                        <span className="ml-1 capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center mt-auto pt-2 border-t">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold">${hotel.price}</span>
                        <span className="text-sm ml-1">per night</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Taxes and fees included</p>
                    </div>
                    
                    <Button className="mt-2 sm:mt-0">
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HotelResults;
