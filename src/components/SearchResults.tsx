
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import FlightResults from '@/components/results/FlightResults';
import HotelResults from '@/components/results/HotelResults';
import ItineraryResults from '@/components/results/ItineraryResults';
import AttractionsResults from '@/components/results/AttractionsResults';
import SaveTripButton from '@/components/results/SaveTripButton';
import { AlertCircle, Gauge } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';

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
        }
        
        setDestinationInfo({
          airQuality,
          weatherAlert,
          currency: '₹ INR',
          timezone: 'IST (UTC+5:30)'
        });
      }
    };
    
    loadDestinationInfo();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Search Results</h3>
        <SaveTripButton />
      </div>
      
      <div className="mb-6 space-y-3">
        <Alert className="bg-amber-50 border-amber-200">
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
        <FlightResults />
      </TabsContent>
      
      <TabsContent value="hotels" className="space-y-4">
        <HotelResults />
      </TabsContent>
      
      <TabsContent value="itinerary" className="space-y-4">
        <ItineraryResults />
      </TabsContent>
      
      <TabsContent value="attractions" className="space-y-4">
        <AttractionsResults />
      </TabsContent>
    </>
  );
};

export default SearchResults;
