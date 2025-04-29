
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

export const fetchFlights = async (params: FlightSearchParams): Promise<FlightResult[]> => {
  const cacheKey = JSON.stringify(params);
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    console.log('Using cached flight data');
    return cache[cacheKey].data;
  }

  try {
    // RapidAPI endpoint for Skyscanner
    const url = `https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create`;
    
    const requestBody = {
      query: {
        market: "IN",
        locale: "en-IN",
        currency: params.currency || "INR",
        queryLegs: [
          {
            originPlaceId: { iata: params.origin },
            destinationPlaceId: { iata: params.destination },
            date: {
              year: parseInt(params.departureDate.split('-')[0]),
              month: parseInt(params.departureDate.split('-')[1]),
              day: parseInt(params.departureDate.split('-')[2])
            }
          }
        ],
        cabinClass: "CABIN_CLASS_ECONOMY",
        adults: params.adults || 1,
        childrenAges: []
      }
    };

    // Make API call
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      // Fall back to sample data if API fails
      const fallbackData = getSampleFlightData(params);
      toast.error("Could not fetch real flight data. Showing sample results instead.");
      
      // Cache the fallback data
      cache[cacheKey] = { data: fallbackData, timestamp: now };
      return fallbackData;
    }

    const data = await response.json();
    
    // Transform API response to our FlightResult interface
    const results: FlightResult[] = transformSkyscannerResponse(data, params);
    
    // Cache the results
    cache[cacheKey] = { data: results, timestamp: now };
    return results;
    
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

// Transform Skyscanner API response to our format
function transformSkyscannerResponse(apiResponse: any, params: FlightSearchParams): FlightResult[] {
  try {
    if (!apiResponse.content || !apiResponse.content.results || !apiResponse.content.results.itineraries) {
      throw new Error('Unexpected API response format');
    }

    const { itineraries, legs, carriers, places } = apiResponse.content.results;
    
    return Object.values(itineraries).slice(0, 10).map((itin: any) => {
      const legId = itin.legIds[0];
      const leg = legs[legId];
      const carrierId = leg.operatingCarrierIds[0];
      const carrier = carriers[carrierId];
      
      const originId = leg.originPlaceId;
      const destinationId = leg.destinationPlaceId;
      const origin = places[originId];
      const destination = places[destinationId];

      const isDirect = !leg.stopCount;
      let layoverInfo = null;
      
      if (!isDirect && leg.stopIds && leg.stopIds.length > 0) {
        const stopId = leg.stopIds[0];
        const stop = places[stopId];
        layoverInfo = {
          airport: stop.iata,
          city: stop.name,
          duration: `${Math.floor(leg.stopDurationMinutes / 60)}h ${leg.stopDurationMinutes % 60}m`
        };
      }

      // Format duration
      const durationHours = Math.floor(leg.durationMinutes / 60);
      const durationMinutes = leg.durationMinutes % 60;
      const formattedDuration = `${durationHours}h ${durationMinutes}m`;

      // Format times
      const departureTime = new Date(leg.departureDateTime).toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      
      const arrivalTime = new Date(leg.arrivalDateTime).toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });

      return {
        id: legId,
        airline: carrier.name || "Unknown Airline",
        flightNumber: leg.operatingCarrierIds.join(' ') || "Unknown",
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        duration: formattedDuration,
        departureAirport: origin.iata,
        departureCity: origin.name,
        arrivalAirport: destination.iata,
        arrivalCity: destination.name,
        price: itin.pricingOptions[0].price.amount,
        direct: isDirect,
        layoverAirport: layoverInfo?.airport,
        layoverCity: layoverInfo?.city,
        layoverDuration: layoverInfo?.duration,
        baggageAllowance: "15 kg", // Default as API might not provide this
        amenities: carrier.name.includes("Air India") ? ['Meal', 'Entertainment'] : 
                 carrier.name.includes("IndiGo") ? ['Paid Meal'] :
                 carrier.name.includes("Vistara") ? ['Premium Meal', 'Entertainment'] :
                 ['Paid Meal'],
        logo: `https://logos.skyscnr.com/images/airlines/favicon/${carrierId}.png`
      };
    });
  } catch (error) {
    console.error('Error transforming flight data:', error);
    return getSampleFlightData(params);
  }
}

// Sample data as fallback
function getSampleFlightData(params: FlightSearchParams): FlightResult[] {
  return [
    {
      id: '1',
      airline: 'Air India',
      flightNumber: 'AI 863',
      departureTime: '06:15 AM',
      arrivalTime: '08:35 AM',
      duration: '2h 20m',
      departureAirport: params.origin || 'DEL',
      departureCity: params.origin === 'BOM' ? 'Mumbai' : 'New Delhi',
      arrivalAirport: params.destination || 'BOM',
      arrivalCity: params.destination === 'DEL' ? 'New Delhi' : 'Mumbai',
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
      departureCity: params.origin === 'BOM' ? 'Mumbai' : 'New Delhi',
      arrivalAirport: params.destination || 'BOM',
      arrivalCity: params.destination === 'DEL' ? 'New Delhi' : 'Mumbai',
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
      departureCity: params.origin === 'BOM' ? 'Mumbai' : 'New Delhi',
      arrivalAirport: params.destination || 'BOM',
      arrivalCity: params.destination === 'DEL' ? 'New Delhi' : 'Mumbai',
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
      departureCity: params.origin === 'BOM' ? 'Mumbai' : 'New Delhi',
      arrivalAirport: params.destination || 'BOM',
      arrivalCity: params.destination === 'DEL' ? 'New Delhi' : 'Mumbai',
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
