
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plane, Heart, Clock, Calendar, ArrowRight, Briefcase, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Sample Indian flight data
const flightData = [
  {
    id: 1,
    airline: 'Air India',
    flightNumber: 'AI 863',
    departureTime: '06:15 AM',
    arrivalTime: '08:35 AM',
    duration: '2h 20m',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    price: 4899,
    direct: true,
    baggageAllowance: '25 kg',
    amenities: ['Meal', 'Entertainment'],
    logo: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=40&h=40'
  },
  {
    id: 2,
    airline: 'IndiGo',
    flightNumber: '6E 6174',
    departureTime: '08:25 AM',
    arrivalTime: '10:40 AM',
    duration: '2h 15m',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    price: 3750,
    direct: true,
    baggageAllowance: '15 kg',
    amenities: ['Paid Meal'],
    logo: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=40&h=40'
  },
  {
    id: 3,
    airline: 'Vistara',
    flightNumber: 'UK 995',
    departureTime: '11:30 AM',
    arrivalTime: '13:55 PM',
    duration: '2h 25m',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    price: 5299,
    direct: true,
    baggageAllowance: '20 kg',
    amenities: ['Premium Meal', 'Entertainment'],
    logo: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=40&h=40'
  },
  {
    id: 4,
    airline: 'SpiceJet',
    flightNumber: 'SG 8169',
    departureTime: '16:45 PM',
    arrivalTime: '20:05 PM',
    duration: '3h 20m',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    price: 3499,
    direct: false,
    layoverAirport: 'AMD',
    layoverCity: 'Ahmedabad',
    layoverDuration: '45m',
    baggageAllowance: '15 kg',
    amenities: ['Paid Meal'],
    logo: 'https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=40&h=40'
  }
];

const FlightResults: React.FC = () => {
  const [sortBy, setSortBy] = useState('price');
  const [filterDirect, setFilterDirect] = useState<string[]>(['all']);
  const [filterAirline, setFilterAirline] = useState('all');
  const [savedFlights, setSavedFlights] = useState<number[]>([]);

  const handleSaveToggle = (flightId: number) => {
    setSavedFlights(prev => 
      prev.includes(flightId) 
        ? prev.filter(id => id !== flightId)
        : [...prev, flightId]
    );
  };

  // Sort flights based on selected option
  const sortedFlights = [...flightData].sort((a, b) => {
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

  const airlines = ['all', ...new Set(flightData.map(flight => flight.airline))];

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
      
      <div className="space-y-4">
        {filteredFlights.map((flight) => (
          <Card key={flight.id} className="overflow-hidden hover:shadow-md transition-all duration-200">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src={flight.logo} 
                      alt={flight.airline}
                      className="w-full h-full object-cover"
                    />
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
                    <span className="text-2xl font-bold">{flight.price}</span>
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
                  May 15, 2025
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
    </div>
  );
};

export default FlightResults;
