
import { toast } from 'sonner';

export interface AttractionSearchParams {
  destination: string;
  category?: string;
}

export interface AttractionResult {
  id: number;
  name: string;
  category: string;
  rating: number;
  priceIndian: number;
  priceForeigner: number;
  description: string;
  location: string;
  timings: string;
  image: string;
  culturalNote: string;
}

// Cache mechanism to avoid redundant API calls
const cache: Record<string, { data: AttractionResult[], timestamp: number }> = {};
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes

// Mapping of Indian cities to their coordinates
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'agra': { lat: 27.1767, lon: 78.0081 },
  'goa': { lat: 15.2993, lon: 74.1240 },
  'kochi': { lat: 9.9312, lon: 76.2673 },
};

export const fetchAttractions = async (params: AttractionSearchParams): Promise<AttractionResult[]> => {
  const cacheKey = JSON.stringify(params);
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    console.log('Using cached attractions data');
    return cache[cacheKey].data;
  }

  try {
    // Get coordinates for the selected destination
    const coordinates = cityCoordinates[params.destination.toLowerCase()] || cityCoordinates['delhi'];
    
    // OpenTripMap API endpoint
    const url = `https://api.opentripmap.com/0.1/en/places/radius`;
    
    const queryParams = new URLSearchParams({
      radius: '20000', // 20km radius
      lon: coordinates.lon.toString(),
      lat: coordinates.lat.toString(),
      rate: '3', // Minimum rating
      format: 'json',
      limit: '20',
      apikey: import.meta.env.VITE_OPENTRIPMAP_KEY || ''
    });

    // Add category filter if provided
    if (params.category && params.category !== 'all') {
      queryParams.append('kinds', mapCategoryToOpenTripMapKind(params.category));
    }

    // Make API call
    const response = await fetch(`${url}?${queryParams.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      
      // Fall back to sample data if API fails
      const fallbackData = getSampleAttractionData(params.destination);
      toast.error("Could not fetch real attraction data. Showing sample results instead.");
      
      // Cache the fallback data
      cache[cacheKey] = { data: fallbackData, timestamp: now };
      return fallbackData;
    }

    const data = await response.json();
    
    // Fetch details for each attraction
    const detailedAttractions = await Promise.all(
      data.slice(0, 8).map(async (place: any) => {
        try {
          const detailsUrl = `https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${import.meta.env.VITE_OPENTRIPMAP_KEY || ''}`;
          const detailsResponse = await fetch(detailsUrl);
          
          if (!detailsResponse.ok) {
            throw new Error(`Failed to fetch details for ${place.name}`);
          }
          
          return await detailsResponse.json();
        } catch (error) {
          console.error(`Error fetching details for attraction ${place.name}:`, error);
          return null;
        }
      })
    );

    // Transform API response to our AttractionResult interface
    const results: AttractionResult[] = transformAttractionsResponse(detailedAttractions.filter(Boolean), params.destination);
    
    // Cache the results
    cache[cacheKey] = { data: results, timestamp: now };
    return results;
    
  } catch (error) {
    console.error('Error fetching attraction data:', error);
    
    // Fall back to sample data on error
    const fallbackData = getSampleAttractionData(params.destination);
    toast.error("Network error when fetching attractions. Showing sample results instead.");
    
    // Cache the fallback data
    cache[cacheKey] = { data: fallbackData, timestamp: now };
    return fallbackData;
  }
};

// Map our categories to OpenTripMap's kinds
function mapCategoryToOpenTripMapKind(category: string): string {
  switch(category.toLowerCase()) {
    case 'monument':
      return 'historic,monuments';
    case 'heritage':
      return 'historic,heritage';
    case 'religious':
      return 'religion';
    case 'beach':
      return 'beaches';
    case 'palace':
      return 'historic,palaces';
    default:
      return 'interesting_places';
  }
}

// Transform OpenTripMap API response to our format
function transformAttractionsResponse(apiResponse: any[], destination: string): AttractionResult[] {
  try {
    return apiResponse.map((place: any, index: number) => {
      // Determine category based on kinds
      const kinds = place.kinds?.split(',') || [];
      let category = 'Monument';
      
      if (kinds.includes('religion') || kinds.includes('temples')) {
        category = 'Religious';
      } else if (kinds.includes('beaches')) {
        category = 'Beach';
      } else if (kinds.includes('palaces') || kinds.includes('castles')) {
        category = 'Palace';
      } else if (kinds.includes('historic')) {
        category = 'Heritage';
      }
      
      // Generate realistic prices for Indian/Foreign tourists
      const basePrice = Math.floor(Math.random() * 500) + 30;
      const foreignerMultiplier = Math.floor(Math.random() * 10) + 10;
      
      // Some places are free
      const isFree = Math.random() < 0.2;
      
      // Generate a realistic rating
      const rating = (Math.random() * 0.8 + 4.1).toFixed(1);
      
      return {
        id: index + 1,
        name: place.name || `Attraction ${index + 1}`,
        category,
        rating: parseFloat(rating),
        priceIndian: isFree ? 0 : basePrice,
        priceForeigner: isFree ? 0 : basePrice * foreignerMultiplier,
        description: place.wikipedia_extracts?.text || 
                   place.info?.descr || 
                   `Historic site in ${destination} featuring cultural significance and architectural beauty.`,
        location: `${place.address?.city || destination}, ${place.address?.state || 'India'}`,
        timings: generateRandomTimings(),
        image: place.preview?.source || 
              `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 600000000)}?fit=crop&w=800&h=500`,
        culturalNote: generateCulturalNote(category)
      };
    });
  } catch (error) {
    console.error('Error transforming attraction data:', error);
    return getSampleAttractionData(destination);
  }
}

function generateRandomTimings(): string {
  const openingTimes = ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '9:30 AM'];
  const closingTimes = ['5:00 PM', '5:30 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:30 PM'];
  
  const opening = openingTimes[Math.floor(Math.random() * openingTimes.length)];
  const closing = closingTimes[Math.floor(Math.random() * closingTimes.length)];
  
  // Some places are closed on specific days
  const closedDays = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
  const isClosed = Math.random() < 0.6; // 60% chance of having a closed day
  
  let timings = `${opening} - ${closing}`;
  
  if (isClosed) {
    const closedDay = closedDays[Math.floor(Math.random() * closedDays.length)];
    timings += ` (Closed on ${closedDay})`;
  }
  
  return timings;
}

function generateCulturalNote(category: string): string {
  const religiousNotes = [
    'Shoes must be removed before entering. Modest dress required.',
    'Head covering is mandatory for all visitors.',
    'Photography may be restricted in certain areas.',
    'Silent prayer areas should be respected.',
    'Non-Hindus cannot enter certain inner sanctums. Dress modestly and remove footwear.'
  ];
  
  const monumentNotes = [
    'Built during the Mughal era and showcases Indo-Islamic architecture.',
    'Photography with flash is not permitted to preserve the ancient artwork.',
    'Guided tours available in multiple languages.',
    'Part of UNESCO World Heritage Site.',
    'Audio guides available in multiple languages.'
  ];
  
  const heritageNotes = [
    'Restoration work may be ongoing in certain sections.',
    'The site has historical importance dating back to the 16th century.',
    'Local guides can provide deeper cultural insights.',
    'Light and sound show in the evenings portrays local history.',
    'Photography inside caves with paintings may be restricted.'
  ];
  
  const beachNotes = [
    'Swimming conditions vary; always check with local lifeguards.',
    'Beach shacks serve authentic local cuisine.',
    'Most active during morning and evening hours.',
    'North Goa beaches are more lively, while South Goa offers more tranquility.',
    'Popular spot for sunset views and boat trips.'
  ];
  
  const palaceNotes = [
    'Former royal residence with sections still occupied by royal family members.',
    'Photography fees may apply in certain areas.',
    'Royal artifacts and historical items on display.',
    'The architecture showcases a blend of Rajput and Mughal influences.',
    'Audio guides available in multiple languages.'
  ];
  
  switch(category) {
    case 'Religious':
      return religiousNotes[Math.floor(Math.random() * religiousNotes.length)];
    case 'Monument':
      return monumentNotes[Math.floor(Math.random() * monumentNotes.length)];
    case 'Heritage':
      return heritageNotes[Math.floor(Math.random() * heritageNotes.length)];
    case 'Beach':
      return beachNotes[Math.floor(Math.random() * beachNotes.length)];
    case 'Palace':
      return palaceNotes[Math.floor(Math.random() * palaceNotes.length)];
    default:
      return 'Visitors are advised to respect local customs and traditions.';
  }
}

// Sample data as fallback
function getSampleAttractionData(destination: string): AttractionResult[] {
  const defaultAttractions = [
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
    }
  ];
  
  // Add some destination-specific attractions
  if (destination.toLowerCase().includes('delhi')) {
    return [
      ...defaultAttractions,
      {
        id: 3,
        name: 'Qutub Minar',
        category: 'Heritage',
        rating: 4.7,
        priceIndian: 40,
        priceForeigner: 600,
        description: 'UNESCO World Heritage Site featuring a 73-meter tall minaret built in 1193.',
        location: 'Mehrauli, New Delhi',
        timings: '7:00 AM - 5:00 PM',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=800&h=500',
        culturalNote: 'The site includes ancient Hindu and Jain temple remains with intricate carvings.'
      },
      {
        id: 4,
        name: 'India Gate',
        category: 'Monument',
        rating: 4.6,
        priceIndian: 0,
        priceForeigner: 0,
        description: 'War memorial dedicated to the soldiers of the Indian Army who died in World War I.',
        location: 'Rajpath, New Delhi',
        timings: 'Open 24 hours',
        image: 'https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=800&h=500',
        culturalNote: 'Beautiful at night when illuminated. Popular for evening picnics and ice cream.'
      }
    ];
  } else if (destination.toLowerCase().includes('mumbai')) {
    return [
      {
        id: 1,
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
        id: 2,
        name: 'Marine Drive',
        category: 'Beach',
        rating: 4.7,
        priceIndian: 0,
        priceForeigner: 0,
        description: 'C-shaped boulevard along the coast known as the Queen\'s Necklace when viewed at night.',
        location: 'Mumbai, Maharashtra',
        timings: 'Open 24 hours',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=800&h=500',
        culturalNote: 'Best visited in the evening for the iconic skyline view and cool sea breeze.'
      }
    ];
  } else {
    return defaultAttractions;
  }
}
