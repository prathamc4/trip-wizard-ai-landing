
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Loader, Map, Hotel, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SearchResults from '@/components/SearchResults';
import { toast } from 'sonner';

// Indian cities for autocomplete
const indianCities = [
  "Agra", "Ahmedabad", "Amritsar", "Bangalore", "Bhopal", "Bhubaneswar", 
  "Chennai", "Dehradun", "Delhi", "Goa", "Guwahati", "Hyderabad", "Jaipur", 
  "Kochi", "Kolkata", "Lucknow", "Mumbai", "Mysore", "Nagpur", "New Delhi",
  "Patna", "Pune", "Shimla", "Srinagar", "Thiruvananthapuram", "Varanasi"
];

const travelPreferences = [
  { id: "adventure", label: "Adventure" },
  { id: "relaxation", label: "Relaxation" },
  { id: "cultural", label: "Cultural" },
  { id: "family", label: "Family-friendly" },
  { id: "budget", label: "Budget" },
  { id: "religious", label: "Religious Sites" },
  { id: "heritage", label: "Heritage" },
  { id: "food", label: "Food Tours" },
  { id: "wildlife", label: "Wildlife" }
];

const TravelPlanningSection = () => {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [budget, setBudget] = useState([2000]);
  const [travelers, setTravelers] = useState("1");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [transportMode, setTransportMode] = useState("flight");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");
  const [filteredStartCities, setFilteredStartCities] = useState<string[]>([]);
  const [filteredDestCities, setFilteredDestCities] = useState<string[]>([]);
  const [showStartCities, setShowStartCities] = useState(false);
  const [showDestCities, setShowDestCities] = useState(false);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setPreferences(prev => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter(pref => pref !== value);
      }
    });
  };

  const handleStartLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartLocation(value);
    
    if (value.length > 1) {
      const filtered = indianCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStartCities(filtered);
      setShowStartCities(true);
    } else {
      setShowStartCities(false);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    
    if (value.length > 1) {
      const filtered = indianCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDestCities(filtered);
      setShowDestCities(true);
    } else {
      setShowDestCities(false);
    }
  };

  const selectStartCity = (city: string) => {
    setStartLocation(city);
    setShowStartCities(false);
  };

  const selectDestCity = (city: string) => {
    setDestination(city);
    setShowDestCities(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!startLocation) {
      toast.error("Please enter your starting location");
      return;
    }
    
    if (!destination) {
      toast.error("Please enter your destination");
      return;
    }
    
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    
    // Fix for the date issue - ensure correct timezone handling
    const formatDateForAPI = (date: Date | undefined): string => {
      if (!date) return '';
      
      // Create a new date object to avoid timezone issues
      // This ensures we use the selected date exactly as displayed to the user
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };
    
    // Store search data in session storage for components to access
    const searchData = {
      startLocation,
      destination,
      startDate: startDate ? formatDateForAPI(startDate) : undefined,
      endDate: endDate ? formatDateForAPI(endDate) : undefined,
      budget: budget[0],
      travelers: parseInt(travelers),
      preferences,
      transportMode
    };
    
    console.log('Search data with fixed dates:', searchData);
    sessionStorage.setItem('travelSearchData', JSON.stringify(searchData));
    
    setIsSearching(true);
    
    // Simulate API loading time
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
      setActiveTab("flights"); // Reset to flights tab when new search is performed
    }, 1500);
  };

  return (
    <section id="plan" className="section bg-gradient-to-b from-white to-blue-50">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-travel-darkBlue">
            Plan Your Next Adventure
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 bg-opacity-90 backdrop-blur-sm">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium">Starting Location</label>
                  <Input 
                    type="text" 
                    placeholder="Enter your starting point"
                    value={startLocation}
                    onChange={handleStartLocationChange}
                    className="w-full"
                    required
                  />
                  {showStartCities && filteredStartCities.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredStartCities.map(city => (
                        <div 
                          key={city}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => selectStartCity(city)}
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-sm font-medium">Destination</label>
                  <Input 
                    type="text" 
                    placeholder="Where do you want to go?"
                    value={destination}
                    onChange={handleDestinationChange}
                    className="w-full"
                    required
                  />
                  {showDestCities && filteredDestCities.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredDestCities.map(city => (
                        <div 
                          key={city}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => selectDestCity(city)}
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Budget (₹)</label>
                  <span className="text-sm font-medium text-travel-blue">₹{budget[0].toLocaleString()}</span>
                </div>
                <Slider
                  defaultValue={[2000]}
                  max={50000}
                  step={1000}
                  value={budget}
                  onValueChange={setBudget}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹5,000</span>
                  <span>₹50,000</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Travelers</label>
                  <Select value={travelers} onValueChange={setTravelers}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select number of travelers" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Traveler' : 'Travelers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Transport in India</label>
                  <Select value={transportMode} onValueChange={setTransportMode}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Domestic Flights</SelectItem>
                      <SelectItem value="train">Train (IRCTC)</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="car">Private Car</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">Trip Preferences</label>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {travelPreferences.map((preference) => (
                    <div key={preference.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={preference.id}
                        checked={preferences.includes(preference.id)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(preference.id, checked === true)
                        }
                      />
                      <label 
                        htmlFor={preference.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {preference.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full md:w-auto px-8 py-6 text-lg bg-travel-green hover:bg-travel-darkBlue"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </div>
          
          {showResults && (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="flights" className="flex items-center">
                    <Map className="mr-2 h-4 w-4" />
                    <span>Flights</span>
                  </TabsTrigger>
                  <TabsTrigger value="hotels" className="flex items-center">
                    <Hotel className="mr-2 h-4 w-4" />
                    <span>Hotels</span>
                  </TabsTrigger>
                  <TabsTrigger value="itinerary" className="flex items-center">
                    <Map className="mr-2 h-4 w-4" />
                    <span>Itinerary</span>
                  </TabsTrigger>
                  <TabsTrigger value="attractions" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Attractions</span>
                  </TabsTrigger>
                </TabsList>
                
                <SearchResults activeTab={activeTab} />
              </Tabs>
            </div>
          )}
        </div>
        
        <div className="hidden lg:block absolute right-0 bottom-0 w-64 h-64 opacity-20 pointer-events-none">
          <img src="https://lovable.dev/wp-content/uploads/plane-travel-illustration.png" alt="Travel illustration" className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  );
};

export default TravelPlanningSection;
