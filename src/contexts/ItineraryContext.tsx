
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { FlightResult } from '@/utils/api/flightAPI';
import { HotelResult } from '@/utils/api/hotelAPI';
import { AttractionResult } from '@/utils/api/attractionsAPI';
import { toast } from 'sonner';
import { saveTrip, Trip, calculateBudgetBreakdown } from '@/services/tripService';

interface ItineraryContextType {
  selectedFlight: FlightResult | null;
  selectedHotel: HotelResult | null;
  selectedAttractions: AttractionResult[];
  selectFlight: (flight: FlightResult | null) => void;
  selectHotel: (hotel: HotelResult | null) => void;
  addAttraction: (attraction: AttractionResult) => void;
  removeAttraction: (attractionId: number) => void;
  clearSelections: () => void;
  hasUserSelections: boolean;
  saveCurrentItinerary: (itineraryDays: any[], notes?: string) => Promise<string | null>;
  totalBudget: number;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const useItinerary = (): ItineraryContextType => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

interface ItineraryProviderProps {
  children: ReactNode;
}

export const ItineraryProvider: React.FC<ItineraryProviderProps> = ({ children }) => {
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelResult | null>(null);
  const [selectedAttractions, setSelectedAttractions] = useState<AttractionResult[]>([]);
  
  // Clear all selections when component mounts
  useEffect(() => {
    clearSelections();
  }, []);

  const selectFlight = (flight: FlightResult | null) => {
    setSelectedFlight(flight);
  };

  const selectHotel = (hotel: HotelResult | null) => {
    setSelectedHotel(hotel);
  };

  const addAttraction = (attraction: AttractionResult) => {
    // Check if attraction already exists in the list
    if (!selectedAttractions.some(attr => attr.id === attraction.id)) {
      setSelectedAttractions(prev => [...prev, attraction]);
    }
  };

  const removeAttraction = (attractionId: number) => {
    setSelectedAttractions(prev => prev.filter(attr => attr.id !== attractionId));
  };

  const clearSelections = () => {
    setSelectedFlight(null);
    setSelectedHotel(null);
    setSelectedAttractions([]);
    
    // Also clear search params from sessionStorage
    sessionStorage.removeItem('travelSearchData');
  };

  // Calculate total budget
  const totalBudget = (selectedFlight?.price || 0) + 
                      (selectedHotel?.price || 0) + 
                      selectedAttractions.reduce((sum, attr) => sum + attr.priceIndian, 0);

  // Add computed property to check if any user selections exist
  const hasUserSelections = Boolean(selectedFlight || selectedHotel || selectedAttractions.length > 0);

  // Function to save current itinerary
  const saveCurrentItinerary = async (itineraryDays: any[], notes?: string): Promise<string | null> => {
    try {
      // Get search data from session storage
      const searchData = sessionStorage.getItem('travelSearchData');
      let destination = 'Unknown Destination';
      let startDate = new Date().toISOString().split('T')[0];
      let endDate = new Date().toISOString().split('T')[0];

      if (searchData) {
        const parsedData = JSON.parse(searchData);
        destination = parsedData.destination || destination;
        
        if (parsedData.startDate) {
          startDate = parsedData.startDate;
        }
        
        if (parsedData.endDate) {
          endDate = parsedData.endDate;
        }
      }

      // Calculate trip duration
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Calculate all budget components in detail
      let totalCalculatedBudget = totalBudget;
      
      // If total budget is too low (which may happen if user didn't select much),
      // set a minimum budget based on duration
      if (totalCalculatedBudget < 1000 * duration) {
        totalCalculatedBudget = 1000 * duration;
      }
      
      // Prepare budget breakdown with more realistic distribution
      const budgetBreakdown = calculateBudgetBreakdown(itineraryDays);
      
      // Add minimum values for any categories that are too low
      if (budgetBreakdown.accommodation < 500 * duration) {
        budgetBreakdown.accommodation = 500 * duration;
      }
      
      if (budgetBreakdown.food < 300 * duration) {
        budgetBreakdown.food = 300 * duration;
      }
      
      if (budgetBreakdown.transportation < 200 * duration) {
        budgetBreakdown.transportation = 200 * duration;
      }
      
      // Recalculate total budget after adjustments
      const adjustedTotalBudget = Object.values(budgetBreakdown).reduce((sum, value) => sum + value, 0);

      // Prepare trip data
      const tripData = {
        destination,
        startDate,
        endDate,
        duration,
        totalBudget: adjustedTotalBudget,
        currency: "INR",
        budgetBreakdown,
        itinerary: itineraryDays,
        notes: notes || "",
        coverImage: `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},travel`
      };

      // Save trip
      const savedTrip = saveTrip(tripData);
      
      // Clear selections after successful save
      clearSelections();
      
      return savedTrip.id;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      toast.error('Failed to save itinerary');
      return null;
    }
  };

  return (
    <ItineraryContext.Provider value={{
      selectedFlight,
      selectedHotel,
      selectedAttractions,
      selectFlight,
      selectHotel,
      addAttraction,
      removeAttraction,
      clearSelections,
      hasUserSelections,
      saveCurrentItinerary,
      totalBudget
    }}>
      {children}
    </ItineraryContext.Provider>
  );
};
