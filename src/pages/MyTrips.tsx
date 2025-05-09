
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TripCard from '@/components/trips/TripCard';
import { getAllTrips, deleteTrip, Trip } from '@/services/tripService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronLeft, Search, SortAsc, Bookmark, CalendarRange } from 'lucide-react';

const MyTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);

  // Load trips from localStorage
  useEffect(() => {
    setLoading(true);
    const savedTrips = getAllTrips();
    setTrips(savedTrips);
    setFilteredTrips(savedTrips);
    setLoading(false);
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let result = [...trips];
    
    // Apply search filter if there's a search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(trip => 
        trip.destination.toLowerCase().includes(term) ||
        trip.notes?.toLowerCase().includes(term)
      );
    }
    
    // Apply sort
    switch (sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'budget-high':
        result.sort((a, b) => b.totalBudget - a.totalBudget);
        break;
      case 'budget-low':
        result.sort((a, b) => a.totalBudget - b.totalBudget);
        break;
      case 'duration-long':
        result.sort((a, b) => b.duration - a.duration);
        break;
      case 'duration-short':
        result.sort((a, b) => a.duration - b.duration);
        break;
    }
    
    setFilteredTrips(result);
  }, [trips, sortBy, searchTerm]);

  // Handle trip deletion
  const handleDeleteTrip = (id: string) => {
    if (deleteTrip(id)) {
      setTrips(prev => prev.filter(trip => trip.id !== id));
      toast.success('Trip deleted successfully');
    } else {
      toast.error('Failed to delete trip');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-green mx-auto"></div>
            <p className="mt-4">Loading your saved trips...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bookmark className="h-6 w-6" /> 
                My Saved Trips
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} saved
              </p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                    <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                    <SelectItem value="duration-long">Duration: Longest First</SelectItem>
                    <SelectItem value="duration-short">Duration: Shortest First</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <CalendarRange className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No trips saved yet</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 
                'No trips match your search criteria.' : 
                'Create and save an itinerary to see it here'}
            </p>
            <Button asChild>
              <Link to="/">Plan a New Trip</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map(trip => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onDelete={handleDeleteTrip} 
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MyTrips;
