
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import FlightResults from '@/components/results/FlightResults';
import HotelResults from '@/components/results/HotelResults';
import ItineraryResults from '@/components/results/ItineraryResults';
import AttractionsResults from '@/components/results/AttractionsResults';
import SaveTripButton from '@/components/results/SaveTripButton';

interface SearchResultsProps {
  activeTab: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ activeTab }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Search Results</h3>
        <SaveTripButton />
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
