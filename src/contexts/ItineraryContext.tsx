
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FlightResult } from '@/utils/api/flightAPI';
import { HotelResult } from '@/utils/api/hotelAPI';
import { AttractionResult } from '@/utils/api/attractionsAPI';

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

  // Add computed property to check if any user selections exist
  const hasUserSelections = Boolean(selectedFlight || selectedHotel || selectedAttractions.length > 0);

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
    }}>
      {children}
    </ItineraryContext.Provider>
  );
};
