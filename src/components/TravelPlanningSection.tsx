
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Loader, Airplane, Hotel, Map, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SearchResults from '@/components/SearchResults';

const travelPreferences = [
  { id: "adventure", label: "Adventure" },
  { id: "relaxation", label: "Relaxation" },
  { id: "cultural", label: "Cultural" },
  { id: "family", label: "Family-friendly" },
  { id: "budget", label: "Budget" },
];

const TravelPlanningSection = () => {
  // State variables for form inputs
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [budget, setBudget] = useState([2000]);
  const [travelers, setTravelers] = useState("1");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");

  // Handle checkbox changes
  const handleCheckboxChange = (value: string, checked: boolean) => {
    setPreferences(prev => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter(pref => pref !== value);
      }
    });
  };
  
  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 2000);
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
                {/* Starting Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Starting Location</label>
                  <Input 
                    type="text" 
                    placeholder="Enter your starting point"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                {/* Destination */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <Input 
                    type="text" 
                    placeholder="Where do you want to go?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
              
                {/* Start Date Picker */}
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
                
                {/* End Date Picker */}
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
              
              {/* Budget Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Budget</label>
                  <span className="text-sm font-medium text-travel-blue">${budget[0]}</span>
                </div>
                <Slider
                  defaultValue={[2000]}
                  max={10000}
                  step={100}
                  value={budget}
                  onValueChange={setBudget}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$500</span>
                  <span>$10,000</span>
                </div>
              </div>
              
              {/* Number of Travelers */}
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
              
              {/* Trip Preferences */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Trip Preferences</label>
                <div className="flex flex-wrap gap-4">
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
              
              {/* Search Button */}
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
          
          {/* Results Section */}
          {showResults && (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="flights" className="flex items-center">
                    <Airplane className="mr-2 h-4 w-4" />
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
        
        {/* Illustrations */}
        <div className="hidden lg:block absolute right-0 bottom-0 w-64 h-64 opacity-20 pointer-events-none">
          <img src="https://lovable.dev/wp-content/uploads/plane-travel-illustration.png" alt="Travel illustration" className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  );
};

export default TravelPlanningSection;
