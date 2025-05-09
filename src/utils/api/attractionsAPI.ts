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
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'lucknow': { lat: 26.8467, lon: 80.9462 },
  'kanpur': { lat: 26.4499, lon: 80.3319 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'indore': { lat: 22.7196, lon: 75.8577 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185 },
  'coimbatore': { lat: 11.0168, lon: 76.9558 },
  'madurai': { lat: 9.9252, lon: 78.1198 },
  'trivandrum': { lat: 8.5241, lon: 76.9366 },
  'srinagar': { lat: 34.0837, lon: 74.7973 },
  'amritsar': { lat: 31.6340, lon: 74.8723 },
  'guwahati': { lat: 26.1445, lon: 91.7362 },
  'patna': { lat: 25.5941, lon: 85.1376 },
  'ranchi': { lat: 23.3441, lon: 85.3096 },
  'raipur': { lat: 21.2514, lon: 81.6296 },
  'bhubaneswar': { lat: 20.2961, lon: 85.8245 },
  'vadodara': { lat: 22.3072, lon: 73.1812 },
  'surat': { lat: 21.1702, lon: 72.8311 },
  'jodhpur': { lat: 26.2389, lon: 73.0243 },
  'udaipur': { lat: 24.5854, lon: 73.7125 },
  'varanasi': { lat: 25.3176, lon: 82.9739 },
  'gaya': { lat: 24.7955, lon: 84.9994 },
  'tirupati': { lat: 13.6288, lon: 79.4192 },
  'vijayawada': { lat: 16.5062, lon: 80.6480 },
  'tiruchirappalli': { lat: 10.7905, lon: 78.7047 },
  'mangalore': { lat: 12.9141, lon: 74.8560 },
  'hubli': { lat: 15.3647, lon: 75.1240 },
  'belgaum': { lat: 15.8497, lon: 74.4977 },
  'aurangabad': { lat: 19.8762, lon: 75.3433 },
  'nashik': { lat: 19.9975, lon: 73.7898 },
  'kolhapur': { lat: 16.7050, lon: 74.2433 },
  'jammu': { lat: 32.7266, lon: 74.8570 },
  'leh': { lat: 34.1526, lon: 77.5771 },
  'shimla': { lat: 31.1048, lon: 77.1734 },
  'dehradun': { lat: 30.3165, lon: 78.0322 },
  'dharamshala': { lat: 32.2190, lon: 76.3234 },
  'siliguri': { lat: 26.7271, lon: 88.3953 },
  'bagdogra': { lat: 26.6810, lon: 88.3286 },
  'dimapur': { lat: 25.9063, lon: 93.7259 },
  'imphal': { lat: 24.8170, lon: 93.9368 },
  'aizawl': { lat: 23.7271, lon: 92.7176 },
  'agartala': { lat: 23.8315, lon: 91.2868 },
  'port blair': { lat: 11.6234, lon: 92.7265 },
  'dibrugarh': { lat: 27.4728, lon: 94.9120 },
  'jabalpur': { lat: 23.1815, lon: 79.9864 },
  'gwalior': { lat: 26.2183, lon: 78.1828 },
  'rajamahendravaram': { lat: 17.0005, lon: 81.8040 },
  'tirunelveli': { lat: 8.7139, lon: 77.7567 },
  'salem': { lat: 11.6643, lon: 78.1460 },
  'thoothukudi': { lat: 8.7642, lon: 78.1348 },
  'pondicherry': { lat: 11.9416, lon: 79.8083 },
  'daman': { lat: 20.3974, lon: 72.8328 },
  'diu': { lat: 20.7141, lon: 70.9876 },
  'kandla': { lat: 23.0333, lon: 70.2167 },
  'bhuj': { lat: 23.2419, lon: 69.6669 },
  'jamnagar': { lat: 22.4707, lon: 70.0577 },
  'porbandar': { lat: 21.6417, lon: 69.6293 },
  'rajkot': { lat: 22.3039, lon: 70.8022 },
  'bhavnagar': { lat: 21.7645, lon: 72.1519 },
  'amreli': { lat: 21.6032, lon: 71.2221 },
  'mehsana': { lat: 23.5880, lon: 72.3693 },
  'nadiad': { lat: 22.6916, lon: 72.8634 },
  'navsari': { lat: 20.8500, lon: 72.9167 },
  'palanpur': { lat: 24.1725, lon: 72.4381 },
  'surendranagar': { lat: 22.7289, lon: 71.6379 },
  'valsad': { lat: 20.6100, lon: 72.9300 },
  'vapi': { lat: 20.3714, lon: 72.9047 },
  'veraval': { lat: 20.9070, lon: 70.3679 },
  'vyara': { lat: 21.1167, lon: 73.4000 },
  'wankaner': { lat: 22.6120, lon: 70.9510 },
  'yavatmal': { lat: 20.3888, lon: 78.1200 },
  'zunheboto': { lat: 26.0010, lon: 94.5160 },
  'karimnagar': { lat: 18.4386, lon: 79.1288 },
  'khammam': { lat: 17.2473, lon: 80.1514 },
  'kurnool': { lat: 15.8281, lon: 78.0373 },
  'nalgonda': { lat: 17.0541, lon: 79.2671 },
  'nandyal': { lat: 15.4786, lon: 78.4836 },
  'nellore': { lat: 14.4426, lon: 79.9865 },
  'ongole': { lat: 15.5057, lon: 80.0499 },
  'sangareddy': { lat: 17.6248, lon: 78.0866 },
  'siddipet': { lat: 18.1010, lon: 78.8486 },
  'suryapet': { lat: 17.1400, lon: 79.6200 },
  'tenali': { lat: 16.2430, lon: 80.6400 },
  'warangal': { lat: 17.9784, lon: 79.5941 },
  'eluru': { lat: 16.7107, lon: 81.0956 },
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
    
    // OpenTripMap API endpoint with provided API key
    const url = `https://api.opentripmap.com/0.1/en/places/radius`;
    
    const queryParams = new URLSearchParams({
      radius: '20000', // 20km radius
      lon: coordinates.lon.toString(),
      lat: coordinates.lat.toString(),
      rate: '3', // Minimum rating
      format: 'json',
      limit: '20',
      apikey: import.meta.env.VITE_OPENTRIPMAP_KEY || '5ae2e3f221c38a28845f05b6cdbd5523a98e8a182f13e2bf12a1f5a5'
    });

    // Add category filter if provided
    if (params.category && params.category !== 'all') {
      queryParams.append('kinds', mapCategoryToOpenTripMapKind(params.category));
    }

    // Make API call with a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const response = await fetch(`${url}?${queryParams.toString()}`);
    console.log(response);
    

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
      data.slice(0, 8).map(async (place: any, index: number) => {
        try {
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200 * index));
          
          const detailsUrl = `https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${import.meta.env.VITE_OPENTRIPMAP_KEY || '5ae2e3f221c38a28845f05b6cdbd5523a98e8a182f13e2bf12a1f5a5'}`;
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
