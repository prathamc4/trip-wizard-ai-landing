
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import FlightResults from '@/components/results/FlightResults';
import HotelResults from '@/components/results/HotelResults';
import ItineraryResults from '@/components/results/ItineraryResults';
import AttractionsResults from '@/components/results/AttractionsResults';
import SaveTripButton from '@/components/results/SaveTripButton';
import { AlertCircle, Gauge } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SearchResultsProps {
  activeTab: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ activeTab }) => {
  // Simulated data for India-specific info
  const destinationInfo = {
    airQuality: 'Moderate',
    weatherAlert: 'Monsoon season (June-September). Occasional heavy rainfall expected.'
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Search Results</h3>
        <SaveTripButton />
      </div>
      
      <div className="mb-6 space-y-3">
        <Alert variant="default" className="bg-amber-50 border-amber-200">
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
          <span>Currency: <strong>₹ INR</strong></span>
          <span className="mx-2">•</span>
          <span>Local Time: <strong>IST (UTC+5:30)</strong></span>
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
