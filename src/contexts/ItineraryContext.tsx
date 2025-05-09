
import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export const ItineraryProvider = ({ children }: ItineraryProviderProps) => {
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelResult | null>(null);
  const [selectedAttractions, setSelectedAttractions] = useState<AttractionResult[]>([]);

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

      // Prepare budget breakdown
      const budgetBreakdown = calculateBudgetBreakdown(itineraryDays);

      // Prepare trip data
      const tripData = {
        destination,
        startDate,
        endDate,
        duration,
        totalBudget,
        currency: "INR",
        budgetBreakdown,
        itinerary: itineraryDays,
        notes: notes || "",
        coverImage: `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},travel`
      };

      // Save trip
      const savedTrip = saveTrip(tripData);
      
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
