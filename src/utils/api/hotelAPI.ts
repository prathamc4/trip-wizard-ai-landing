
import { toast } from 'sonner';

export interface HotelSearchParams {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  currency?: string;
}

export interface HotelResult {
  id: number;
  name: string;
  rating: number;
  price: number;
  address: string;
  amenities: string[];
  vegetarianFriendly: boolean;
  distanceFromStation: string;
  description: string;
  images: string[];
}

// Cache mechanism to avoid redundant API calls
const cache: Record<string, { data: HotelResult[], timestamp: number }> = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const fetchHotels = async (params: HotelSearchParams): Promise<HotelResult[]> => {
  const cacheKey = JSON.stringify(params);
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    console.log('Using cached hotel data');
    return cache[cacheKey].data;
  }

  try {
    console.log('Fetching hotel data with params:', params);
    
    // Due to CORS restrictions, we'll use sample data for now
    // In a production app, you would use a backend proxy or serverless function
    console.log('Using sample hotel data due to CORS restrictions');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use sample data
    const fallbackData = getSampleHotelData(params);
    
    // Cache the data
    cache[cacheKey] = { data: fallbackData, timestamp: now };
    return fallbackData;
    
  } catch (error) {
    console.error('Error fetching hotel data:', error);
    
    // Fall back to sample data on error
    const fallbackData = getSampleHotelData(params);
    toast.error("Network error when fetching hotels. Showing sample results instead.");
    
    // Cache the fallback data
    cache[cacheKey] = { data: fallbackData, timestamp: now };
    return fallbackData;
  }
};

// Transform SerpAPI Google Hotels response to our format
function transformSerpAPIHotelResponse(apiResponse: any, params: HotelSearchParams): HotelResult[] {
  try {
    // Check if we have hotel results
    if (!apiResponse.hotels_results || !apiResponse.hotels_results.length) {
      throw new Error('No hotel results found in SerpAPI response');
    }
    
    const hotels = apiResponse.hotels_results;
    
    return hotels.slice(0, 10).map((hotel: any, index: number) => {
      // Extract images
      const images = [];
      if (hotel.thumbnail) {
        images.push(hotel.thumbnail);
      }
      
      if (hotel.photos && hotel.photos.length > 0) {
        hotel.photos.slice(0, 4).forEach((photo: any) => {
          if (photo.image) {
            images.push(photo.image);
          }
        });
      }
      
      // If no images are available, use placeholder
      if (images.length === 0) {
        images.push('https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400');
      }
      
      // Extract and normalize amenities
      const hotelAmenities = [];
      if (hotel.amenities) {
        if (hotel.amenities.includes('Free Wi-Fi') || hotel.amenities.includes('Wi-Fi')) {
          hotelAmenities.push('wifi');
        }
        if (hotel.amenities.includes('Parking') || hotel.amenities.includes('Free parking')) {
          hotelAmenities.push('parking');
        }
        if (hotel.amenities.includes('Restaurant') || hotel.amenities.includes('Breakfast')) {
          hotelAmenities.push('breakfast');
        }
        if (hotel.amenities.includes('Air conditioning')) {
          hotelAmenities.push('ac');
        }
        if (hotel.amenities.includes('Pool') || hotel.amenities.includes('Swimming pool')) {
          hotelAmenities.push('pool');
        }
        if (hotel.amenities.includes('Gym') || hotel.amenities.includes('Fitness center')) {
          hotelAmenities.push('gym');
        }
      }
      
      // Ensure we have at least some amenities
      if (hotelAmenities.length === 0) {
        const hasAC = Math.random() > 0.2;
        const hasWifi = Math.random() > 0.1;
        
        if (hasWifi) hotelAmenities.push('wifi');
        if (hasAC) hotelAmenities.push('ac');
      }
      
      // Determine vegetarian-friendliness
      const isVegFriendly = hotel.amenities?.includes('Vegetarian meals') || 
                           hotel.description?.toLowerCase().includes('vegetarian') || 
                           Math.random() > 0.3; // More likely in India
      
      // Calculate or estimate distance from nearest station
      const distanceKm = hotel.distance_from_center ? 
                         parseFloat(hotel.distance_from_center.replace(/[^\d.]/g, '')) : 
                         (Math.random() * 6 + 0.5).toFixed(1);
                         
      const stationType = Math.random() > 0.5 ? "Railway Station" : "Metro Station";
      const nearestStation = `${distanceKm} km from nearest ${stationType}`;
      
      // Extract or generate description
      const description = hotel.description || 
                        hotel.overview || 
                        `${hotel.name} offers comfortable accommodation in ${params.destination} with modern amenities and excellent service.`;

      // Determine rating (out of 5)
      let rating = hotel.rating || 0;
      if (typeof rating === 'string') {
        rating = parseFloat(rating);
      }
      // If rating is out of 10, convert to out of 5
      if (rating > 5) {
        rating = rating / 2;
      }
      // If no rating, generate a realistic one
      if (!rating) {
        rating = Math.floor(Math.random() * 2) + 3;
      }

      return {
        id: index + 1,
        name: hotel.name || `Hotel ${index + 1}`,
        rating: rating,
        price: hotel.price || 2000 + Math.floor(Math.random() * 20000),
        address: hotel.address || `${params.destination}, India`,
        amenities: hotelAmenities,
        vegetarianFriendly: isVegFriendly,
        distanceFromStation: nearestStation,
        description: description,
        images: images
      };
    });
  } catch (error) {
    console.error('Error transforming hotel data:', error);
    return getSampleHotelData();
  }
}

// Sample data as fallback - enhanced with destination-specific data
function getSampleHotelData(params: HotelSearchParams = {destination: 'New Delhi', checkInDate: '2025-05-15', checkOutDate: '2025-05-18'}): HotelResult[] {
  // Extract destination to provide more relevant sample data
  const destination = params.destination || 'New Delhi';
  
  return [
    {
      id: 1,
      name: `Luxury Palace ${destination}`,
      rating: 5,
      price: 12500,
      address: `Downtown, ${destination}, India`,
      amenities: ['wifi', 'parking', 'breakfast', 'ac', 'pool', 'gym'],
      vegetarianFriendly: true,
      distanceFromStation: `4.5 km from ${destination} Railway Station`,
      description: `Luxury 5-star hotel in ${destination} with elegant rooms, multiple dining options, and excellent service.`,
      images: [
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400',
        'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=600&h=400',
        'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=600&h=400'
      ]
    },
    {
      id: 2,
      name: `OYO Townhouse ${destination}`,
      rating: 3,
      price: 2299,
      address: `Central Area, ${destination}, India`,
      amenities: ['wifi', 'ac', 'breakfast'],
      vegetarianFriendly: true,
      distanceFromStation: `1.2 km from ${destination} Metro Station`,
      description: `Budget-friendly hotel in ${destination} with clean rooms and essential amenities for travelers.`,
      images: [
        'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=600&h=400',
        'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=600&h=400',
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400'
      ]
    },
    {
      id: 3,
      name: `Grand Royal ${destination}`,
      rating: 5,
      price: 18500,
      address: `Diplomatic Area, ${destination}, India`,
      amenities: ['wifi', 'parking', 'breakfast', 'ac', 'pool', 'spa', 'gym'],
      vegetarianFriendly: true,
      distanceFromStation: `7 km from ${destination} Railway Station`,
      description: `Opulent 5-star hotel in ${destination} with royal decor, world-class dining, and impeccable service.`,
      images: [
        'https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=600&h=400',
        'https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=600&h=400',
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400'
      ]
    },
    {
      id: 4,
      name: `Hotel Central ${destination}`,
      rating: 3,
      price: 1899,
      address: `Near Market, ${destination}, India`,
      amenities: ['wifi', 'ac'],
      vegetarianFriendly: true,
      distanceFromStation: `0.5 km from ${destination} Railway Station`,
      description: `Convenient budget hotel close to the railway station in ${destination} with basic amenities.`,
      images: [
        'https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=600&h=400',
        'https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=600&h=400',
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400'
      ]
    }
  ];
}
