
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import FlightResults from '@/components/results/FlightResults';
import HotelResults from '@/components/results/HotelResults';
import ItineraryResults from '@/components/results/ItineraryResults';
import AttractionsResults from '@/components/results/AttractionsResults';
import SaveTripButton from '@/components/results/SaveTripButton';
import { AlertCircle, Gauge, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import ApiDebugStatus from './ApiDebugStatus';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useItinerary } from '@/contexts/ItineraryContext';
import { Badge } from './ui/badge';

interface SearchResultsProps {
  activeTab: string;
}

interface DestinationInfo {
  airQuality: string;
  weatherAlert: string;
  currency: string;
  timezone: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ activeTab }) => {
  const [destinationInfo, setDestinationInfo] = useState<DestinationInfo>({
    airQuality: 'Moderate',
    weatherAlert: 'Monsoon season (June-September). Occasional heavy rainfall expected.',
    currency: '₹ INR',
    timezone: 'IST (UTC+5:30)'
  });
  const [apiStatus, setApiStatus] = useState({
    flights: { error: false, errorMessage: '' },
    hotels: { error: false, errorMessage: '' },
    attractions: { error: false, errorMessage: '' },
    itinerary: { error: false, errorMessage: '' }
  });
  const [demoModeActive, setDemoModeActive] = useState(false);
  
  // Get itinerary context to display selection stats
  const { selectedFlight, selectedHotel, selectedAttractions } = useItinerary();
  const selectedItemsCount = (selectedFlight ? 1 : 0) + (selectedHotel ? 1 : 0) + selectedAttractions.length;

  useEffect(() => {
    // Load destination information based on the search
    const loadDestinationInfo = () => {
      const searchData = sessionStorage.getItem('travelSearchData');
      
      if (searchData) {
        const parsedData = JSON.parse(searchData);
        const destination = parsedData.destination?.toLowerCase() || '';
        
        // Simulate API call to get destination-specific information
        let airQuality = 'Moderate';
        let weatherAlert = '';
        
        // Set season-based data
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1; // 1-12
        
        if (month >= 6 && month <= 9) {
          weatherAlert = 'Monsoon season (June-September). Occasional heavy rainfall expected.';
        } else if (month >= 3 && month <= 5) {
          weatherAlert = 'Summer season (March-May). High temperatures expected during day.';
        } else {
          weatherAlert = 'Winter season (October-February). Pleasant days, cooler evenings.';
        }
        
        // Set location-specific data
        if (destination.includes('delhi')) {
          airQuality = 'Poor to Moderate';
          weatherAlert += ' Air pollution levels may be high.';
        } else if (destination.includes('mumbai')) {
          airQuality = 'Moderate';
          weatherAlert += ' Coastal humidity expected.';
        } else if (destination.includes('goa')) {
          airQuality = 'Good';
          weatherAlert += ' Beach conditions suitable for swimming.';
        } else if (destination.includes('chennai')) {
          airQuality = 'Moderate';
          weatherAlert += ' Expect humid coastal climate.';
        } else if (destination.includes('thiruvananthapuram') || destination.includes('kerala')) {
          airQuality = 'Good';
          weatherAlert += ' Tropical climate with possible rain showers.';
        }
        
        setDestinationInfo({
          airQuality,
          weatherAlert,
          currency: '₹ INR',
          timezone: 'IST (UTC+5:30)'
        });
      }
    };
    
    // Check if API key is available
    const checkApiKeys = () => {
      const hasApiKey = import.meta.env.VITE_SERPAPI_KEY || 
                        import.meta.env.VITE_GEMINI_API_KEY || 
                        import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!hasApiKey) {
        setDemoModeActive(true);
        console.warn("No API keys found. Running in demo mode with sample data.");
      }
    };
    
    // Monitor for API errors by listening to console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      
      // Check if this is an API error
      const errorMessage = args.join(' ');
      if (errorMessage.includes('Error fetching flight data') || 
          errorMessage.includes('Failed to fetch') && activeTab === 'flights') {
        setApiStatus(prev => ({
          ...prev,
          flights: { error: true, errorMessage }
        }));
      } else if (errorMessage.includes('Error fetching hotel data') || 
                errorMessage.includes('Failed to fetch') && activeTab === 'hotels') {
        setApiStatus(prev => ({
          ...prev,
          hotels: { error: true, errorMessage }
        }));
      } else if (errorMessage.includes('Error fetching attraction data') || 
                errorMessage.includes('Failed to fetch') && activeTab === 'attractions') {
        setApiStatus(prev => ({
          ...prev,
          attractions: { error: true, errorMessage }
        }));
      } else if (errorMessage.includes('Error generating itinerary') || 
                errorMessage.includes('Failed to fetch') && activeTab === 'itinerary') {
        setApiStatus(prev => ({
          ...prev,
          itinerary: { error: true, errorMessage }
        }));
      }
    };
    
    loadDestinationInfo();
    checkApiKeys();
    
    return () => {
      console.error = originalConsoleError;
    };
  }, [activeTab]);

  const handleApiRetry = (apiName: 'flights' | 'hotels' | 'attractions' | 'itinerary') => {
    // Reset error state for this API
    setApiStatus(prev => ({
      ...prev,
      [apiName]: { error: false, errorMessage: '' }
    }));
    
    toast.success(`Retrying ${apiName} API connection...`);
    
    // Force refresh the component
    window.location.reload();
  };

  const handleAddApiKey = () => {
    toast.info(
      <div>
        <p>To use real API data, add your API keys in the .env.local file:</p>
        <pre className="bg-gray-100 p-2 mt-2 rounded text-xs">
          VITE_SERPAPI_KEY=your_key_here<br/>
          VITE_GEMINI_API_KEY=your_key_here
        </pre>
      </div>,
      { duration: 8000 }
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Search Results</h3>
        <div className="flex items-center gap-3">
          {selectedItemsCount > 0 && (
            <div className="flex items-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <span className="font-medium">{selectedItemsCount}</span> 
                <span className="ml-1">item{selectedItemsCount !== 1 ? 's' : ''} selected</span>
              </Badge>
            </div>
          )}
          <SaveTripButton />
        </div>
      </div>
      
      {demoModeActive && (
        <Alert variant="warning" className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Mode Active</AlertTitle>
          <AlertDescription className="mt-1">
            <p>Running with sample data since no API keys are configured.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleAddApiKey}
            >
              How to Add API Keys
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 space-y-3">
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Travel Advisory</AlertTitle>
          <AlertDescription>
            {destinationInfo.weatherAlert}
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center px-4 py-2 rounded-md bg-gray-50 text-sm">
          <Gauge className="h-4 w-4 mr-2 text-blue-500" />
          <span>Air Quality Index: <strong>{destinationInfo.airQuality}</strong></span>
          <span className="mx-2">•</span>
          <span>Currency: <strong>{destinationInfo.currency}</strong></span>
          <span className="mx-2">•</span>
          <span>Local Time: <strong>{destinationInfo.timezone}</strong></span>
        </div>
      </div>
      
      <TabsContent value="flights" className="space-y-4">
        <ApiDebugStatus 
          isUsingSampleData={apiStatus.flights.error} 
          apiName="Flight" 
          lastError={apiStatus.flights.errorMessage}
          onRetry={() => handleApiRetry('flights')}
        />
        <FlightResults />
      </TabsContent>
      
      <TabsContent value="hotels" className="space-y-4">
        <ApiDebugStatus 
          isUsingSampleData={apiStatus.hotels.error} 
          apiName="Hotel" 
          lastError={apiStatus.hotels.errorMessage}
          onRetry={() => handleApiRetry('hotels')}
        />
        <HotelResults />
      </TabsContent>
      
      <TabsContent value="itinerary" className="space-y-4">
        <ApiDebugStatus 
          isUsingSampleData={apiStatus.itinerary.error} 
          apiName="Itinerary" 
          lastError={apiStatus.itinerary.errorMessage}
          onRetry={() => handleApiRetry('itinerary')}
        />
        <ItineraryResults />
      </TabsContent>
      
      <TabsContent value="attractions" className="space-y-4">
        <ApiDebugStatus 
          isUsingSampleData={apiStatus.attractions.error} 
          apiName="Attractions" 
          lastError={apiStatus.attractions.errorMessage}
          onRetry={() => handleApiRetry('attractions')}
        />
        <AttractionsResults />
      </TabsContent>
    </>
  );
};

export default SearchResults;
