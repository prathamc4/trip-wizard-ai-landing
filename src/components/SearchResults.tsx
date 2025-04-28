
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResultsProps {
  activeTab: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ activeTab }) => {
  return (
    <>
      <TabsContent value="flights" className="space-y-4">
        <h3 className="text-xl font-semibold">Available Flights</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={`flight-${item}`} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <div className="w-1/4">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="w-1/4 text-center">
                  <Skeleton className="h-6 w-20 mb-2 mx-auto" />
                  <Skeleton className="h-4 w-28 mx-auto" />
                </div>
                <div className="w-1/4 text-right">
                  <Skeleton className="h-6 w-16 ml-auto mb-2" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="hotels" className="space-y-4">
        <h3 className="text-xl font-semibold">Recommended Hotels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={`hotel-${item}`} className="border rounded-lg p-4 hover:shadow-md transition">
              <Skeleton className="h-32 w-full mb-4 rounded-md" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="itinerary" className="space-y-4">
        <h3 className="text-xl font-semibold">Suggested Itinerary</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((day) => (
            <div key={`day-${day}`} className="space-y-3">
              <h4 className="font-medium text-lg">Day {day}</h4>
              <div className="space-y-3 pl-4 border-l-2 border-travel-blue">
                {[1, 2, 3].map((activity) => (
                  <div key={`activity-${day}-${activity}`} className="border-b pb-2">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="attractions" className="space-y-4">
        <h3 className="text-xl font-semibold">Popular Attractions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={`attraction-${item}`} className="border rounded-lg overflow-hidden hover:shadow-md transition">
              <Skeleton className="h-40 w-full" />
              <div className="p-3">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </>
  );
};

export default SearchResults;
