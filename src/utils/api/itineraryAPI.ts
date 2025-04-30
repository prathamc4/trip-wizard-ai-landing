import { toast } from 'sonner';
import { FlightResult } from './flightAPI';
import { HotelResult } from './hotelAPI';
import { AttractionResult } from './attractionsAPI';

export interface ItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  preferences: string[];
  flights?: FlightResult[];
  hotels?: HotelResult[];
  attractions?: AttractionResult[];
}

export interface Activity {
  id: string;
  time: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  notes: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: Activity[];
}

export interface ItineraryResponse {
  days: ItineraryDay[];
}

// Cache mechanism to avoid redundant API calls
const cache: Record<string, { data: ItineraryResponse, timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const generateItinerary = async (request: ItineraryRequest): Promise<ItineraryResponse> => {
  const cacheKey = JSON.stringify({
    destination: request.destination,
    startDate: request.startDate,
    endDate: request.endDate,
    preferences: request.preferences
  });
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    console.log('Using cached itinerary data');
    return cache[cacheKey].data;
  }

  try {
    console.log('Generating itinerary for destination:', request.destination);
    
    // Due to CORS restrictions, we'll use sample data instead of direct Gemini API calls
    // In a production app, you would use a backend proxy or serverless function
    console.log('Using sample itinerary data due to CORS restrictions');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate destination-specific itinerary
    const fallbackData = getSampleItinerary(request);
    
    // Cache the results
    cache[cacheKey] = { data: fallbackData, timestamp: now };
    
    console.log('Successfully generated sample itinerary');
    return fallbackData;
    
  } catch (error) {
    console.error('Error generating itinerary:', error);
    
    // Fall back to sample data on error
    const fallbackData = getSampleItinerary(request);
    toast.error("Network error when generating itinerary. Using sample itinerary.");
    
    // Cache the fallback data
    cache[cacheKey] = { data: fallbackData, timestamp: now };
    return fallbackData;
  }
};

// Generate comprehensive prompt for Gemini API
function generateGeminiPrompt(request: ItineraryRequest): string {
  // Calculate number of days
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  const dayCount = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Format preferences for better AI understanding
  const formattedPreferences = request.preferences.join(', ');
  
  // Include selected flight if available
  let flightInfo = "";
  if (request.flights && request.flights.length > 0) {
    const flight = request.flights[0];
    flightInfo = `\nSelected Flight: ${flight.airline} (${flight.flightNumber}) from ${flight.departureCity} to ${flight.arrivalCity}. Departure: ${flight.departureTime}, Arrival: ${flight.arrivalTime}.`;
  }
  
  // Include selected hotel if available
  let hotelInfo = "";
  if (request.hotels && request.hotels.length > 0) {
    const hotel = request.hotels[0];
    hotelInfo = `\nAccommodation: ${hotel.name} at ${hotel.address}. Rating: ${hotel.rating} stars.`;
  }
  
  // Include top attractions if available
  let attractionsInfo = "";
  if (request.attractions && request.attractions.length > 0) {
    attractionsInfo = "\nNotable attractions to consider: " + 
      request.attractions.slice(0, 5).map(a => a.name).join(', ') + ".";
  }
  
  return `Create a detailed ${dayCount}-day itinerary for a trip to ${request.destination}, India from ${request.startDate} to ${request.endDate}.
  
  The traveler has indicated preferences for: ${formattedPreferences || 'general sightseeing'}.${flightInfo}${hotelInfo}${attractionsInfo}
  
  Please create a structured day-by-day itinerary following these requirements:
  1. Include appropriate meal times following Indian customs (breakfast 8-9am, lunch 1-2pm, dinner 7-8pm)
  2. Account for religious site visiting protocols and dress codes
  3. Consider seasonal weather patterns (e.g., avoid outdoor activities during peak afternoon heat in summer)
  4. Include local transportation options between attractions
  5. Incorporate authentic local food experiences
  6. Add culturally appropriate activities
  
  For each day, provide:
  - Date
  - Detailed timeline with specific times
  - Activity types (transport, food, attraction, accommodation)
  - Descriptions
  - Cost estimates in INR
  - Special notes (dress code, cultural considerations, etc.)
  
  Return your response ONLY as a valid JSON object with the structure:
  {
    "days": [
      {
        "day": 1,
        "date": "YYYY-MM-DD",
        "activities": [
          {
            "id": "1-1",
            "time": "08:00 AM",
            "type": "food|transport|attraction|accommodation",
            "title": "Activity name",
            "description": "Detailed description",
            "icon": "utensils|plane|car|camera|bed|temple",
            "cost": 1000,
            "notes": "Special instructions or dress code"
          }
        ]
      }
    ]
  }

  Do not include any explanatory text before or after the JSON. Only return the JSON object itself.`;
}

// Transform Gemini API response to our format
function transformGeminiResponse(aiResponse: any, request: ItineraryRequest): ItineraryResponse {
  try {
    if (!aiResponse.days || !Array.isArray(aiResponse.days)) {
      throw new Error('Invalid AI response format');
    }
    
    // Format dates properly
    const startDate = new Date(request.startDate);
    
    // Process each day
    const processedDays = aiResponse.days.map((day: any, index: number) => {
      // Calculate the actual date for this day
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      const formattedDate = currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Ensure activities have proper IDs and icons
      const processedActivities = day.activities?.map((activity: any, actIdx: number) => {
        return {
          id: `${day.day || index+1}-${actIdx+1}`,
          time: activity.time || "12:00 PM",
          type: activity.type || "attraction",
          title: activity.title || `Activity ${actIdx+1}`,
          description: activity.description || "Experience the local culture and sights",
          icon: mapActivityTypeToIcon(activity.type || "attraction"),
          cost: typeof activity.cost === 'number' ? activity.cost : 
                typeof activity.cost === 'string' ? parseInt(activity.cost.replace(/[^0-9]/g, '') || "0") : 0,
          notes: activity.notes || ""
        };
      }) || [];
      
      return {
        day: day.day || index+1,
        date: formattedDate,
        activities: processedActivities
      };
    });
    
    return { days: processedDays };
  } catch (error) {
    console.error('Error transforming Gemini response:', error);
    return getSampleItinerary(request);
  }
}

// Map activity type to appropriate icon
function mapActivityTypeToIcon(type: string): string {
  switch(type.toLowerCase()) {
    case 'transport':
      return Math.random() > 0.5 ? 'car' : 'plane';
    case 'accommodation':
      return 'bed';
    case 'food':
      return 'utensils';
    case 'attraction':
      return 'camera';
    case 'religious':
      return 'building'; // Changed from 'temple' to 'building' as Temple is not available
    default:
      return 'camera';
  }
}

// Sample data as fallback - enhanced with destination-specific data
function getSampleItinerary(request: ItineraryRequest): ItineraryResponse {
  // Calculate number of days
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  const dayCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  // Extract destination to customize the itinerary
  const destination = request.destination || 'New Delhi';
  
  // Generate daily itineraries
  const days: ItineraryDay[] = [];
  
  for (let i = 0; i < Math.min(dayCount, 5); i++) {
    const currentDay = new Date(start);
    currentDay.setDate(start.getDate() + i);
    
    const formattedDate = currentDay.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    days.push({
      day: i + 1,
      date: formattedDate,
      activities: generateSampleActivities(i + 1, destination)
    });
  }
  
  return { days };
}

// Generate sample activities for a specific destination
function generateSampleActivities(day: number, destination: string): Activity[] {
  // Create destination-specific activities
  let landmarkName = "Famous Landmark";
  let localFood = "Local Specialties";
  let culturalSite = "Cultural Site";
  
  // Customize based on popular destinations
  if (destination.toLowerCase().includes("delhi")) {
    landmarkName = "Red Fort";
    localFood = "Chandni Chowk Street Food";
    culturalSite = "Humayun's Tomb";
  } else if (destination.toLowerCase().includes("mumbai")) {
    landmarkName = "Gateway of India";
    localFood = "Vada Pav at Juhu Beach";
    culturalSite = "Elephanta Caves";
  } else if (destination.toLowerCase().includes("jaipur")) {
    landmarkName = "Amber Fort";
    localFood = "Rajasthani Thali";
    culturalSite = "City Palace";
  } else if (destination.toLowerCase().includes("goa")) {
    landmarkName = "Baga Beach";
    localFood = "Goan Seafood";
    culturalSite = "Basilica of Bom Jesus";
  } else if (destination.toLowerCase().includes("kerala") || destination.toLowerCase().includes("kochi") || destination.toLowerCase().includes("thiruvananthapuram")) {
    landmarkName = "Kovalam Beach";
    localFood = "Kerala Sadhya";
    culturalSite = "Padmanabhaswamy Temple";
  }
  
  if (day === 1) {
    return [
      {
        id: '1-1',
        time: '08:15 AM',
        type: 'transport',
        title: `Arrival in ${destination}`,
        description: `Flight to ${destination} International Airport`,
        icon: 'plane',
        cost: 4899,
        notes: 'Terminal 3, Check-in 2 hours before departure'
      },
      {
        id: '1-2',
        time: '10:45 AM',
        type: 'transport',
        title: 'Airport Transfer',
        description: `Prepaid taxi from airport to hotel`,
        icon: 'car',
        cost: 600,
        notes: 'Prepaid taxi counter at airport arrival area'
      },
      {
        id: '1-3',
        time: '12:00 PM',
        type: 'accommodation',
        title: 'Hotel Check-in',
        description: `Luxury hotel in ${destination}`,
        icon: 'bed',
        cost: 12500,
        notes: 'Early check-in arranged'
      },
      {
        id: '1-4',
        time: '01:30 PM',
        type: 'food',
        title: 'Lunch at Local Restaurant',
        description: `Try ${localFood}`,
        icon: 'utensils',
        cost: 1200,
        notes: 'Vegetarian options available'
      },
      {
        id: '1-5',
        time: '04:00 PM',
        type: 'attraction',
        title: `Visit ${landmarkName}`,
        description: `Explore the iconic landmark of ${destination}`,
        icon: 'camera',
        cost: 600,
        notes: 'Entry fee: ₹600 for foreigners, ₹35 for Indians'
      },
      {
        id: '1-6',
        time: '07:30 PM',
        type: 'food',
        title: 'Dinner at Authentic Restaurant',
        description: 'Famous local restaurant with traditional cuisine',
        icon: 'utensils',
        cost: 1500,
        notes: 'Busy place, reservation recommended'
      }
    ];
  } else if (day === 2) {
    return [
      {
        id: '2-1',
        time: '07:00 AM',
        type: 'food',
        title: 'Breakfast at hotel',
        description: 'Buffet breakfast with Indian and continental options',
        icon: 'utensils',
        cost: 0,
        notes: 'Included with stay'
      },
      {
        id: '2-2',
        time: '09:00 AM',
        type: 'attraction',
        title: `Visit ${culturalSite}`,
        description: `Explore this UNESCO World Heritage Site in ${destination}`,
        icon: 'camera',
        cost: 600,
        notes: 'Entry fee: ₹600 for foreigners, ₹35 for Indians.'
      },
      {
        id: '2-3',
        time: '12:30 PM',
        type: 'food',
        title: 'Local Street Food Experience',
        description: `Try authentic ${destination} street food specialties`,
        icon: 'utensils',
        cost: 400,
        notes: 'Street food experience, multiple small shops'
      },
      {
        id: '2-4',
        time: '02:30 PM',
        type: 'attraction',
        title: `${destination} Museum`,
        description: 'Explore local history and artifacts',
        icon: 'camera',
        cost: 500,
        notes: 'Guided tours available in English and Hindi'
      },
      {
        id: '2-5',
        time: '06:00 PM',
        type: 'attraction',
        title: `${destination} Cultural Performance`,
        description: 'Traditional dance or music performance',
        icon: 'building',
        cost: 800,
        notes: 'Shows run for approximately 2 hours'
      },
      {
        id: '2-6',
        time: '08:30 PM',
        type: 'food',
        title: 'Fine Dining Experience',
        description: `Upscale restaurant featuring ${destination} specialties`,
        icon: 'utensils',
        cost: 2500,
        notes: 'Fine dining, reservation essential'
      }
    ];
  } else {
    // Day 3 or later
    return [
      {
        id: `${day}-1`,
        time: '07:00 AM',
        type: 'food',
        title: 'Breakfast at hotel',
        description: 'Buffet breakfast with Indian and continental options',
        icon: 'utensils',
        cost: 0,
        notes: 'Included with stay'
      },
      {
        id: `${day}-2`,
        time: '09:00 AM',
        type: 'attraction',
        title: `Day trip to nearby attraction in ${destination}`,
        description: `Explore notable landmarks around ${destination}`,
        icon: 'camera',
        cost: 800,
        notes: 'Entry fee: ₹800 for foreigners, ₹50 for Indians'
      },
      {
        id: `${day}-3`,
        time: '12:00 PM',
        type: 'food',
        title: 'Regional Cuisine Lunch',
        description: `Restaurant featuring ${destination} specialties`,
        icon: 'utensils',
        cost: 800,
        notes: 'Known for authentic regional dishes'
      },
      {
        id: `${day}-4`,
        time: '02:00 PM',
        type: 'attraction',
        title: `Shopping at ${destination} Market`,
        description: 'Traditional market for souvenirs and crafts',
        icon: 'camera',
        cost: 0,
        notes: 'Bring cash for shopping, bargaining expected'
      },
      {
        id: `${day}-5`,
        time: '06:00 PM',
        type: 'transport',
        title: 'Return to hotel',
        description: 'Taxi from shopping area to hotel',
        icon: 'car',
        cost: 300,
        notes: 'Use Uber or Ola app for reliable service'
      },
      {
        id: `${day}-6`,
        time: '07:30 PM',
        type: 'food',
        title: `${day === dayCount ? 'Farewell' : 'Special'} Dinner`,
        description: `Special dinner with ${destination} cultural experience`,
        icon: 'utensils',
        cost: 2000,
        notes: 'Celebration of local cuisine'
      }
    ];
  }
}
