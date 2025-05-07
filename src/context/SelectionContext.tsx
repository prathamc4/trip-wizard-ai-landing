
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FlightResult, HotelResult } from '@/utils/api';
import { toast } from 'sonner';

interface SelectionContextType {
  selectedFlight: FlightResult | null;
  selectedHotel: HotelResult | null;
  selectFlight: (flight: FlightResult) => void;
  selectHotel: (hotel: HotelResult) => void;
  clearFlight: () => void;
  clearHotel: () => void;
  totalCost: number;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelResult | null>(null);

  const selectFlight = (flight: FlightResult) => {
    setSelectedFlight(flight);
    toast.success('Flight added to your itinerary!');
    
    // Save to session storage
    sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
  };

  const selectHotel = (hotel: HotelResult) => {
    setSelectedHotel(hotel);
    toast.success('Hotel added to your itinerary!');
    
    // Save to session storage
    sessionStorage.setItem('selectedHotel', JSON.stringify(hotel));
  };

  const clearFlight = () => {
    setSelectedFlight(null);
    sessionStorage.removeItem('selectedFlight');
  };

  const clearHotel = () => {
    setSelectedHotel(null);
    sessionStorage.removeItem('selectedHotel');
  };

  // Calculate total cost
  const totalCost = (selectedFlight?.price || 0) + (selectedHotel?.price || 0) * 
    ((): number => {
      // Calculate number of nights based on stored travel dates
      const searchData = sessionStorage.getItem('travelSearchData');
      if (searchData) {
        const { startDate, endDate } = JSON.parse(searchData);
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return Math.max(1, nights);
        }
      }
      return 1; // Default to 1 night
    })();

  // Load selections from session storage on initialization
  React.useEffect(() => {
    const savedFlight = sessionStorage.getItem('selectedFlight');
    const savedHotel = sessionStorage.getItem('selectedHotel');
    
    if (savedFlight) {
      try {
        setSelectedFlight(JSON.parse(savedFlight));
      } catch (e) {
        console.error("Error parsing saved flight:", e);
        sessionStorage.removeItem('selectedFlight');
      }
    }
    
    if (savedHotel) {
      try {
        setSelectedHotel(JSON.parse(savedHotel));
      } catch (e) {
        console.error("Error parsing saved hotel:", e);
        sessionStorage.removeItem('selectedHotel');
      }
    }
  }, []);

  return (
    <SelectionContext.Provider value={{
      selectedFlight,
      selectedHotel,
      selectFlight,
      selectHotel,
      clearFlight,
      clearHotel,
      totalCost
    }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = (): SelectionContextType => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
