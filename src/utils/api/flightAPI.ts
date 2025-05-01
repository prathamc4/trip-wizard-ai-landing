import { toast } from 'sonner';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  currency?: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  departureAirport: string;
  departureCity: string;
  arrivalAirport: string;
  arrivalCity: string;
  price: number;
  direct: boolean;
  layoverAirport?: string;
  layoverCity?: string;
  layoverDuration?: string;
  baggageAllowance: string;
  amenities: string[];
  logo: string;
}

// Cache mechanism to avoid redundant API calls
const cache: Record<string, { data: FlightResult[], timestamp: number }> = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// List of public CORS proxies to try
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

export const fetchFlights = async (params: FlightSearchParams): Promise<FlightResult[]> => {
  const cacheKey = JSON.stringify(params);
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    console.log('Using cached flight data');
    return cache[cacheKey].data;
  }

  try {
    console.log('Fetching flight data with params:', params);
    
    // Check if we have a Serpapi key
    const apiKey = import.meta.env.VITE_SERPAPI_KEY;
    if (!apiKey) {
      console.warn('SerpAPI key not found in environment variables');
      // If no API key, use sample data immediately
      throw new Error('SerpAPI key not found');
    }

    // Try direct API call first
    let serpApiUrl = `https://serpapi.com/search.json?engine=google_flights&departure_id=${encodeURIComponent(params.origin)}&arrival_id=${encodeURIComponent(params.destination)}&outbound_date=${params.departureDate}${params.returnDate ? `&return_date=${params.returnDate}` : ''}&adults=${params.adults || 1}&currency=${params.currency || 'INR'}&api_key=${apiKey}`;
    
    console.log('Making API request to SerpAPI for flight data');
    
    // Try the direct request first
    try {
      const response = await fetch(serpApiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('SerpAPI response received successfully');
        
        // Transform the API response to our format
        const transformedData = transformSerpAPIResponse(data, params);
        
        // Cache the transformed data
        cache[cacheKey] = { data: transformedData, timestamp: now };
        return transformedData;
      }
      
      // If direct request fails, log the error but continue to try proxies
      const errorText = await response.text();
      console.warn('Direct SerpAPI request failed:', response.status, errorText);
      throw new Error(`SerpAPI direct request failed: ${response.status}`);
    } catch (directError) {
      console.warn('Direct API call failed, trying CORS proxies');
      
      // Try each proxy in sequence
      for (const proxy of CORS_PROXIES) {
        try {
          console.log(`Attempting with CORS proxy: ${proxy}`);
          
          // Use the proxy to make the request
          const proxyUrl = `${proxy}${encodeURIComponent(serpApiUrl)}`;
          
          const proxyResponse = await fetch(proxyUrl);
          
          if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            console.log('Proxy response successful');
            
            // Transform the API response to our format
            const transformedData = transformSerpAPIResponse(data, params);
            
            // Cache the transformed data
            cache[cacheKey] = { data: transformedData, timestamp: now };
            return transformedData;
          }
          
          // This proxy failed, try the next one
          const errorText = await proxyResponse.text();
          console.warn(`Proxy ${proxy} failed:`, proxyResponse.status, errorText);
        } catch (proxyError) {
          // This proxy failed, continue to the next one
          console.warn(`Proxy ${proxy} error:`, proxyError);
        }
      }
      
      // All proxies failed, throw an error to trigger sample data
      throw new Error('All CORS proxies failed');
    }
  } catch (error) {
    console.error('Error fetching flight data:', error);
    
    // Fall back to sample data on error
    const fallbackData = getSampleFlightData(params);
    toast.error("Network error when fetching flights. Showing sample results instead.");
    
    // Cache the fallback data
    cache[cacheKey] = { data: fallbackData, timestamp: now };
    return fallbackData;
  }
};

// Transform SerpAPI Google Flights response to our format
function transformSerpAPIResponse(apiResponse: any, params: FlightSearchParams): FlightResult[] {
  try {
    // Check if we have flight results
    if (!apiResponse.flights_results || !apiResponse.flights_results.length) {
      throw new Error('No flight results found in SerpAPI response');
    }

    const flights = apiResponse.flights_results;
    
    return flights.slice(0, 10).map((flight: any, index: number) => {
      // Extract departure and arrival information
      const departureInfo = flight.departure_airport || {};
      const arrivalInfo = flight.arrival_airport || {};
      
      // Extract layover information if exists
      const hasLayover = flight.layovers && flight.layovers.length > 0;
      let layoverInfo = null;
      
      if (hasLayover && flight.layovers[0]) {
        const layover = flight.layovers[0];
        layoverInfo = {
          airport: layover.airport?.name || "Unknown",
          city: layover.airport?.name?.split(" ")[0] || "Unknown",
          duration: layover.duration || "Unknown"
        };
      }

      // Format flight duration
      const duration = flight.duration || "Unknown";
      
      // Format airline logo
      const logo = flight.airline?.logo || `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${flight.airline?.name?.toLowerCase().replace(/\s+/g, '')}.com&size=64`;

      return {
        id: `flight-${index + 1}`,
        airline: flight.airline?.name || "Unknown Airline",
        flightNumber: flight.flight_number || `FL${1000 + index}`,
        departureTime: flight.departure_time?.time || "Unknown",
        arrivalTime: flight.arrival_time?.time || "Unknown",
        duration: duration,
        departureAirport: departureInfo.id || params.origin,
        departureCity: departureInfo.name || params.origin,
        arrivalAirport: arrivalInfo.id || params.destination,
        arrivalCity: arrivalInfo.name || params.destination,
        price: flight.price?.total?.amount || 0,
        direct: !hasLayover,
        layoverAirport: layoverInfo?.airport,
        layoverCity: layoverInfo?.city,
        layoverDuration: layoverInfo?.duration,
        baggageAllowance: flight.baggage_info || "15 kg",
        amenities: flight.amenities?.map((amenity: string) => amenity) || ["Standard Service"],
        logo: logo
      };
    });
  } catch (error) {
    console.error('Error transforming flight data:', error);
    return getSampleFlightData(params);
  }
}

// Sample data as fallback - keeping the same sample data
function getSampleFlightData(params: FlightSearchParams): FlightResult[] {
  // Enhanced sample data with more variety
  return [
    {
      id: '1',
      airline: 'Air India',
      flightNumber: 'AI 863',
      departureTime: '06:15 AM',
      arrivalTime: '08:35 AM',
      duration: '2h 20m',
      departureAirport: params.origin || 'DEL',
      departureCity: params.origin === 'BOM' ? 'Mumbai' : params.origin || 'New Delhi',
      arrivalAirport: params.destination || 'BOM',
      arrivalCity: params.destination || 'Mumbai',
      price: 4899,
      direct: true,
      baggageAllowance: '25 kg',
      amenities: ['Meal', 'Entertainment'],
      logo: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=40&h=40'
    },
    {
      id: '2',
      airline: 'IndiGo',
      flightNumber: '6E 6174',
      departureTime: '08:25 AM',
      arrivalTime: '10:40 AM',
      duration: '2h 15m',
      departureAirport: params.origin || 'DEL',
      departureCity: params.origin === 'BOM' ? 'Mumbai' : params.origin || 'New Delhi',
      arrivalAirport: params.destination || 'BOM',
      arrivalCity: params.destination || 'Mumbai',
      price: 3750,
      direct: true,
      baggageAllowance: '15 kg',
      amenities: ['Paid Meal'],
      logo: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=40&h=40'
    },
    {
      id: '3',
      airline: 'Vistara',
      flightNumber: 'UK 995',
      departureTime: '11:30 AM',
      arrivalTime: '13:55 PM',
      duration: '2h 25m',
      departureAirport: params.origin || 'DEL',
      departureCity: params.origin === 'BOM' ? 'Mumbai' : params.origin || 'New Delhi',
      arrivalAirport: params.destination || 'BOM',
      arrivalCity: params.destination || 'Mumbai',
      price: 5299,
      direct: true,
      baggageAllowance: '20 kg',
      amenities: ['Premium Meal', 'Entertainment'],
      logo: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=40&h=40'
    },
    {
      id: '4',
      airline: 'SpiceJet',
      flightNumber: 'SG 8169',
      departureTime: '16:45 PM',
      arrivalTime: '20:05 PM',
      duration: '3h 20m',
      departureAirport: params.origin || 'DEL',
      departureCity: params.origin === 'BOM' ? 'Mumbai' : params.origin || 'New Delhi',
      arrivalAirport: params.destination || 'BOM',
      arrivalCity: params.destination || 'Mumbai',
      price: 3499,
      direct: false,
      layoverAirport: 'AMD',
      layoverCity: 'Ahmedabad',
      layoverDuration: '45m',
      baggageAllowance: '15 kg',
      amenities: ['Paid Meal'],
      logo: 'https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=40&h=40'
    }
  ];
}
