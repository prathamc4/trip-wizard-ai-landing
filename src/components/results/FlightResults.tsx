
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plane, Heart, Clock, Calendar, ArrowRight, Briefcase, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchFlights, FlightResult } from '@/utils/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const FlightResults: React.FC = () => {
  const [sortBy, setSortBy] = useState('price');
  const [filterDirect, setFilterDirect] = useState<string[]>(['all']);
  const [filterAirline, setFilterAirline] = useState('all');
  const [savedFlights, setSavedFlights] = useState<string[]>([]);
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [airlines, setAirlines] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFlights = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve search params from session storage or use defaults
        const searchData = sessionStorage.getItem('travelSearchData');
        let origin = 'DEL';
        let destination = 'BOM';
        let departureDate = '2025-05-15';
        let returnDate = '2025-05-19'; // Initialize returnDate with an empty string or a default value

        if (searchData) {
          const parsedData = JSON.parse(searchData);
          origin = parsedData.startLocation || origin;
          destination = parsedData.destination || destination;
          
          if (parsedData.startDate) {
            const date = new Date(parsedData.startDate);
            departureDate = date.toISOString().split('T')[0];
          }
          if (parsedData.endDate) {
            const date = new Date(parsedData.endDate);
            returnDate = date.toISOString().split('T')[0];
          }
        }

        // Fetch flights
        const flightResults = await fetchFlights({
          origin,
          destination,
          departureDate,
          returnDate,
          adults: 1,
          currency: 'INR'
        });

        setFlights(flightResults);

        // Extract unique airlines for filter
        const uniqueAirlines = ['all', ...new Set(flightResults.map(flight => flight.airline))];
        setAirlines(uniqueAirlines);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Failed to load flight data. Please try again later.');
        toast.error('Could not load flight data');
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, []);

  const handleSaveToggle = (flightId: string) => {
    setSavedFlights(prev => 
      prev.includes(flightId) 
        ? prev.filter(id => id !== flightId)
        : [...prev, flightId]
    );

    if (!savedFlights.includes(flightId)) {
      toast.success('Flight saved to favorites!');
    }
  };

  // Sort flights based on selected option
  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'departure') return a.departureTime.localeCompare(b.departureTime);
    return 0;
  });

  // Filter flights based on selected options
  const filteredFlights = sortedFlights.filter(flight => {
    // Filter by direct/connecting
    if (!filterDirect.includes('all')) {
      if (filterDirect.includes('direct') && !flight.direct) return false;
      if (filterDirect.includes('connecting') && flight.direct) return false;
    }
    
    // Filter by airline
    if (filterAirline !== 'all' && flight.airline !== filterAirline) {
      return false;
    }
    
    return true;
  });

  // Loading skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="departure">Departure Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Flight type:</span>
          <ToggleGroup type="multiple" value={filterDirect} onValueChange={setFilterDirect}>
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="direct">Direct</ToggleGroupItem>
            <ToggleGroupItem value="connecting">Connecting</ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Airline:</span>
          <Select value={filterAirline} onValueChange={setFilterAirline}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Airlines" />
            </SelectTrigger>
            <SelectContent>
              {airlines.map((airline) => (
                <SelectItem key={airline} value={airline}>
                  {airline === 'all' ? 'All Airlines' : airline}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredFlights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No flights match your current filters.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setFilterDirect(['all']);
              setFilterAirline('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlights.map((flight) => (
            <Card key={flight.id} className="overflow-hidden hover:shadow-md transition-all duration-200">
              <CardContent className="p-0">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {flight.logo ? (
                        <img 
                          src={flight.logo} 
                          alt={flight.airline}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).onerror = null;
                            (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/e2e8f0/a0aec0?text=✈';
                          }}
                        />
                      ) : (
                        <Plane className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{flight.airline}</p>
                      <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleSaveToggle(flight.id)}
                    className="relative transition-all duration-300"
                  >
                    <Heart className={`h-5 w-5 ${savedFlights.includes(flight.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                    {savedFlights.includes(flight.id) && 
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                      </span>
                    }
                  </Button>
                </div>

                <div className="px-4 py-3 bg-muted/30 flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-lg">{flight.departureTime}</p>
                      <p className="text-xs text-muted-foreground">{flight.departureAirport}</p>
                      <p className="text-xs text-muted-foreground">{flight.departureCity}</p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 sm:w-28 md:w-36">
                        <div className="absolute w-full top-1/2 h-0.5 bg-gray-300"></div>
                        <Plane className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-4 h-4 text-muted-foreground" />
                        <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1.5">{flight.duration}</span>
                      {!flight.direct && (
                        <span className="text-xs text-amber-600">
                          {flight.layoverCity} ({flight.layoverDuration})
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-semibold text-lg">{flight.arrivalTime}</p>
                      <p className="text-xs text-muted-foreground">{flight.arrivalAirport}</p>
                      <p className="text-xs text-muted-foreground">{flight.arrivalCity}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-baseline">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="text-2xl font-bold">{flight.price.toLocaleString()}</span>
                    </div>
                    
                    <Button className="ml-auto">
                      Select Flight
                    </Button>
                  </div>
                </div>
                
                <div className="px-4 py-2 text-xs flex flex-wrap gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {flight.direct ? 'Direct flight' : 'Has layover'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    Baggage: {flight.baggageAllowance}
                  </div>
                  <div className="flex items-center gap-2">
                    {flight.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="bg-white">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightResults;
