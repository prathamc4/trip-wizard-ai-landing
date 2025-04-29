
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
    // OpenAI API endpoint for itinerary generation
    const url = 'https://api.openai.com/v1/chat/completions';

    // Generate itinerary request prompt
    const prompt = generateAIPrompt(request);

    // Make API call to OpenAI
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert Indian travel planner with deep knowledge of local customs, festivals, and attractions. Create detailed itineraries that respect cultural norms, religious practices, and incorporate authentic experiences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      // Fall back to sample data if API fails
      const fallbackData = getSampleItinerary(request);
      toast.error("Could not connect to AI for itinerary generation. Using sample itinerary.");
      
      // Cache the fallback data
      cache[cacheKey] = { data: fallbackData, timestamp: now };
      return fallbackData;
    }

    const data = await response.json();
    
    let itineraryData: ItineraryResponse;
    try {
      // Parse the completion from OpenAI
      const jsonResponse = JSON.parse(data.choices[0].message.content);
      
      // Validate and transform to our format
      itineraryData = transformAIResponse(jsonResponse, request);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fall back to sample data if parsing fails
      itineraryData = getSampleItinerary(request);
      toast.error("Could not process AI response. Using sample itinerary.");
    }
    
    // Cache the results
    cache[cacheKey] = { data: itineraryData, timestamp: now };
    return itineraryData;
    
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

// Generate comprehensive prompt for AI
function generateAIPrompt(request: ItineraryRequest): string {
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
  
  Format your response as a JSON object with the structure:
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
  }`;
}

// Transform AI response to our format
function transformAIResponse(aiResponse: any, request: ItineraryRequest): ItineraryResponse {
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
    console.error('Error transforming AI response:', error);
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
      return 'temple';
    default:
      return 'camera';
  }
}

// Sample data as fallback
function getSampleItinerary(request: ItineraryRequest): ItineraryResponse {
  // Calculate number of days
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  const dayCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  // Generate daily itineraries
  const days: ItineraryDay[] = [];
  
  for (let i = 0; i < Math.min(dayCount, 3); i++) {
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
      activities: generateSampleActivities(i + 1, request.destination)
    });
  }
  
  return { days };
}

// Generate sample activities for a day
function generateSampleActivities(day: number, destination: string): Activity[] {
  if (day === 1) {
    return [
      {
        id: '1-1',
        time: '08:15 AM',
        type: 'transport',
        title: `Flight to ${destination}`,
        description: `Air India (AI 863), Mumbai to ${destination}`,
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
        description: 'Luxury hotel, Deluxe Room',
        icon: 'bed',
        cost: 12500,
        notes: 'Early check-in arranged'
      },
      {
        id: '1-4',
        time: '01:30 PM',
        type: 'food',
        title: 'Lunch at Local Restaurant',
        description: 'Authentic local cuisine with vegetarian options',
        icon: 'utensils',
        cost: 1200,
        notes: 'Vegetarian options available'
      },
      {
        id: '1-5',
        time: '04:00 PM',
        type: 'attraction',
        title: 'Visit Popular Landmark',
        description: 'Explore the iconic landmark with rich history',
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
        title: 'Heritage Site Visit',
        description: 'Explore a UNESCO World Heritage Site',
        icon: 'camera',
        cost: 600,
        notes: 'Entry fee: ₹600 for foreigners, ₹35 for Indians.'
      },
      {
        id: '2-3',
        time: '12:30 PM',
        type: 'food',
        title: 'Local Street Food Experience',
        description: 'Try authentic street food specialties',
        icon: 'utensils',
        cost: 400,
        notes: 'Street food experience, multiple small shops'
      },
      {
        id: '2-4',
        time: '02:30 PM',
        type: 'attraction',
        title: 'Cultural Museum Visit',
        description: 'Explore local history and artifacts',
        icon: 'camera',
        cost: 500,
        notes: 'Guided tours available in English and Hindi'
      },
      {
        id: '2-5',
        time: '06:00 PM',
        type: 'attraction',
        title: 'Evening Performance',
        description: 'Traditional dance or music performance',
        icon: 'temple',
        cost: 800,
        notes: 'Shows run for approximately 2 hours'
      },
      {
        id: '2-6',
        time: '08:30 PM',
        type: 'food',
        title: 'Fine Dining Experience',
        description: 'Upscale restaurant featuring regional specialties',
        icon: 'utensils',
        cost: 2500,
        notes: 'Fine dining, reservation essential'
      }
    ];
  } else {
    return [
      {
        id: '3-1',
        time: '07:00 AM',
        type: 'food',
        title: 'Breakfast at hotel',
        description: 'Buffet breakfast with Indian and continental options',
        icon: 'utensils',
        cost: 0,
        notes: 'Included with stay'
      },
      {
        id: '3-2',
        time: '09:00 AM',
        type: 'attraction',
        title: 'Morning Visit to Famous Site',
        description: 'Explore another notable landmark',
        icon: 'camera',
        cost: 600,
        notes: 'Entry fee: ₹600 for foreigners, ₹35 for Indians'
      },
      {
        id: '3-3',
        time: '12:00 PM',
        type: 'food',
        title: 'Regional Cuisine Lunch',
        description: 'Restaurant featuring local specialties',
        icon: 'utensils',
        cost: 800,
        notes: 'Known for authentic regional dishes'
      },
      {
        id: '3-4',
        time: '02:00 PM',
        type: 'attraction',
        title: 'Shopping at Local Bazaar',
        description: 'Traditional market for souvenirs and crafts',
        icon: 'camera',
        cost: 0,
        notes: 'Bring cash for shopping, bargaining expected'
      },
      {
        id: '3-5',
        time: '06:00 PM',
        type: 'transport',
        title: 'Return to hotel',
        description: 'Taxi from shopping area to hotel',
        icon: 'car',
        cost: 300,
        notes: 'Use Uber or Ola app for reliable service'
      },
      {
        id: '3-6',
        time: '07:30 PM',
        type: 'food',
        title: 'Farewell Dinner',
        description: 'Special dinner with cultural experience',
        icon: 'utensils',
        cost: 2000,
        notes: 'Celebration of local cuisine'
      }
    ];
  }
}
