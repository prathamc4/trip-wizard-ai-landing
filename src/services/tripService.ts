
// Trip type definitions
export interface TripActivity {
  time: string;
  activity: string;
  location?: string;
  cost: number;
  notes?: string;
  type?: string;
  icon?: string;
}

export interface TripDay {
  day: number;
  date: string;
  activities: TripActivity[];
}

export interface BudgetBreakdown {
  accommodation: number;
  activities: number;
  transportation: number;
  food: number;
  other: number;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalBudget: number;
  currency: string;
  budgetBreakdown: BudgetBreakdown;
  itinerary: TripDay[];
  notes?: string;
  createdAt: string;
  coverImage?: string;
}

const STORAGE_KEY = 'savedTrips';

// Get all saved trips
export const getAllTrips = (): Trip[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing saved trips:', error);
    return [];
  }
};

// Get a trip by its ID
export const getTripById = (id: string): Trip | null => {
  const trips = getAllTrips();
  return trips.find(trip => trip.id === id) || null;
};

// Save a new trip
export const saveTrip = (tripData: Omit<Trip, 'id' | 'createdAt'>): Trip => {
  const trips = getAllTrips();
  
  // Generate a unique ID
  const id = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Create new trip object with ID and createdAt
  const newTrip: Trip = {
    ...tripData,
    id,
    createdAt: new Date().toISOString()
  };
  
  // Add to existing trips
  const updatedTrips = [...trips, newTrip];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips));
  
  return newTrip;
};

// Delete a trip by ID
export const deleteTrip = (id: string): boolean => {
  const trips = getAllTrips();
  const filteredTrips = trips.filter(trip => trip.id !== id);
  
  if (filteredTrips.length === trips.length) {
    // No trip was removed
    return false;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTrips));
  return true;
};

// Update an existing trip
export const updateTrip = (id: string, newData: Partial<Trip>): Trip | null => {
  const trips = getAllTrips();
  const tripIndex = trips.findIndex(trip => trip.id === id);
  
  if (tripIndex === -1) {
    return null;
  }
  
  const updatedTrip = { ...trips[tripIndex], ...newData };
  trips[tripIndex] = updatedTrip;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  return updatedTrip;
};

// Calculate budget breakdown from itinerary
export const calculateBudgetBreakdown = (itinerary: TripDay[]): BudgetBreakdown => {
  const breakdown: BudgetBreakdown = {
    accommodation: 0,
    activities: 0,
    transportation: 0,
    food: 0,
    other: 0
  };
  
  itinerary.forEach(day => {
    day.activities.forEach(activity => {
      if (!activity.type) {
        breakdown.other += activity.cost || 0;
        return;
      }
      
      switch(activity.type.toLowerCase()) {
        case 'accommodation':
          breakdown.accommodation += activity.cost || 0;
          break;
        case 'attraction':
          breakdown.activities += activity.cost || 0;
          break;
        case 'transport':
          breakdown.transportation += activity.cost || 0;
          break;
        case 'food':
          breakdown.food += activity.cost || 0;
          break;
        default:
          breakdown.other += activity.cost || 0;
      }
    });
  });
  
  return breakdown;
};
