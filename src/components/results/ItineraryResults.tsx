import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Shuffle, Clock, MapPin, Bed, Coffee, Camera, Car, Plane, Building, IndianRupee, Utensils, Loader, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { generateItinerary, ItineraryDay, Activity } from '@/utils/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useItinerary } from '@/contexts/ItineraryContext';
import { Card, CardContent } from '@/components/ui/card';

const ItineraryResults: React.FC = () => {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [languagePreference, setLanguagePreference] = useState("english");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get selected items from context
  const { 
    selectedFlight, 
    selectedHotel, 
    selectedAttractions, 
    selectFlight, 
    selectHotel, 
    removeAttraction 
  } = useItinerary();

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve search params from session storage or use defaults
        const searchData = sessionStorage.getItem('travelSearchData');
        let destination = 'New Delhi';
        let startDate = '2025-05-15';
        let endDate = '2025-05-18';
        let preferences: string[] = [];

        if (searchData) {
          const parsedData = JSON.parse(searchData);
          destination = parsedData.destination || destination;
          
          if (parsedData.startDate) {
            const start = new Date(parsedData.startDate);
            startDate = start.toISOString().split('T')[0];
          }
          
          if (parsedData.endDate) {
            const end = new Date(parsedData.endDate);
            endDate = end.toISOString().split('T')[0];
          }
          
          if (parsedData.preferences && Array.isArray(parsedData.preferences)) {
            preferences = parsedData.preferences;
          }
        }

        // Generate itinerary with proper API key reference
        const itineraryResponse = await generateItinerary({
          destination,
          startDate,
          endDate,
          preferences
        });

        setItinerary(itineraryResponse.days);
      } catch (err) {
        console.error('Error generating itinerary:', err);
        setError('Failed to generate itinerary. Please try again later.');
        toast.error('Could not generate itinerary');
      } finally {
        setLoading(false);
      }
    };

    loadItinerary();
  }, []);

  // Function to incorporate selected flight into itinerary
  useEffect(() => {
    if (!loading && itinerary.length > 0) {
      if (selectedFlight) {
        // Create a deep copy of the itinerary
        let updatedItinerary = JSON.parse(JSON.stringify(itinerary));
        
        // Add or update flight in day 1
        const flightActivity: Activity = {
          id: `flight-${selectedFlight.id}`,
          time: selectedFlight.departureTime,
          type: 'transport',
          title: `Flight: ${selectedFlight.departureCity} to ${selectedFlight.arrivalCity}`,
          description: `${selectedFlight.airline} ${selectedFlight.flightNumber}`,
          icon: 'plane',
          cost: selectedFlight.price,
          notes: `Departure: ${selectedFlight.departureAirport} | Arrival: ${selectedFlight.arrivalAirport} | Duration: ${selectedFlight.duration}`
        };
        
        // Check if flight activity already exists
        const flightIndex = updatedItinerary[0].activities.findIndex(
          (act) => act.type === 'transport' && act.icon === 'plane'
        );
        
        if (flightIndex !== -1) {
          // Update existing flight
          updatedItinerary[0].activities[flightIndex] = flightActivity;
        } else {
          // Add new flight at the beginning of day 1
          updatedItinerary[0].activities.unshift(flightActivity);
          
          // Sort activities by time
          updatedItinerary[0].activities.sort((a, b) => {
            const timeA = parseInt(a.time.replace(/[^0-9]/g, ''));
            const timeB = parseInt(b.time.replace(/[^0-9]/g, ''));
            return a.time.includes('PM') && !a.time.includes('12:') ? timeA + 1200 : timeA - 
                  (b.time.includes('PM') && !b.time.includes('12:') ? timeB + 1200 : timeB);
          });
        }
        
        setItinerary(updatedItinerary);
      }
    }
  }, [selectedFlight, loading, itinerary]);

  // Function to incorporate selected hotel into itinerary
  useEffect(() => {
    if (!loading && itinerary.length > 0) {
      if (selectedHotel) {
        // Create a deep copy of the itinerary
        let updatedItinerary = JSON.parse(JSON.stringify(itinerary));
        
        // Add or update hotel in day 1
        const hotelActivity: Activity = {
          id: `hotel-${selectedHotel.id}`,
          time: '12:00 PM',
          type: 'accommodation',
          title: `Hotel: ${selectedHotel.name}`,
          description: selectedHotel.description.substring(0, 100) + '...',
          icon: 'bed',
          cost: selectedHotel.price,
          notes: `Rating: ${selectedHotel.rating} stars | Address: ${selectedHotel.address}`
        };
        
        // Check if hotel activity already exists
        const hotelIndex = updatedItinerary[0].activities.findIndex(
          (act) => act.type === 'accommodation' && act.icon === 'bed'
        );
        
        if (hotelIndex !== -1) {
          // Update existing hotel
          updatedItinerary[0].activities[hotelIndex] = hotelActivity;
        } else {
          // Add new hotel (after flight if exists, otherwise at beginning)
          const flightIndex = updatedItinerary[0].activities.findIndex(
            (act) => act.type === 'transport' && act.icon === 'plane'
          );
          
          if (flightIndex !== -1) {
            updatedItinerary[0].activities.splice(flightIndex + 1, 0, hotelActivity);
          } else {
            updatedItinerary[0].activities.unshift(hotelActivity);
          }
          
          // Sort activities by time
          updatedItinerary[0].activities.sort((a, b) => {
            const timeA = parseInt(a.time.replace(/[^0-9]/g, ''));
            const timeB = parseInt(b.time.replace(/[^0-9]/g, ''));
            return a.time.includes('PM') && !a.time.includes('12:') ? timeA + 1200 : timeA - 
                  (b.time.includes('PM') && !b.time.includes('12:') ? timeB + 1200 : timeB);
          });
        }
        
        setItinerary(updatedItinerary);
      }
    }
  }, [selectedHotel, loading, itinerary]);

  // Function to incorporate selected attractions into itinerary
  useEffect(() => {
    if (!loading && itinerary.length > 0) {
      if (selectedAttractions.length > 0) {
        // Create a deep copy of the itinerary
        let updatedItinerary = JSON.parse(JSON.stringify(itinerary));
        
        // Distribute attractions across days
        selectedAttractions.forEach((attraction, index) => {
          // Determine which day to add the attraction to (distribute evenly)
          const dayIndex = Math.min(index % updatedItinerary.length, updatedItinerary.length - 1);
          
          // Create attraction activity
          const attractionActivity: Activity = {
            id: `attraction-${attraction.id}`,
            time: '10:00 AM', // Default time, will be adjusted later
            type: 'attraction',
            title: attraction.name,
            description: attraction.description,
            icon: 'camera',
            cost: showPricing === 'indian' ? attraction.priceIndian : attraction.priceForeigner,
            notes: `${attraction.location} | ${attraction.timings} | ${attraction.culturalNote || ''}`
          };
          
          // Check if this attraction already exists
          const existingIndex = updatedItinerary[dayIndex].activities.findIndex(
            (act) => act.id === `attraction-${attraction.id}`
          );
          
          if (existingIndex === -1) {
            // Add new attraction
            updatedItinerary[dayIndex].activities.push(attractionActivity);
            
            // Distribute attraction times throughout the day
            const attractionCount = updatedItinerary[dayIndex].activities.filter(
              act => act.type === 'attraction'
            ).length;
            
            // Assign staggered times between 9 AM and 4 PM
            const hour = 9 + (attractionCount % 7);
            const amPm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour > 12 ? hour - 12 : hour;
            attractionActivity.time = `${hour12}:00 ${amPm}`;
            
            // Sort activities by time
            updatedItinerary[dayIndex].activities.sort((a, b) => {
              const timeA = parseInt(a.time.replace(/[^0-9]/g, ''));
              const timeB = parseInt(b.time.replace(/[^0-9]/g, ''));
              return a.time.includes('PM') && !a.time.includes('12:') ? timeA + 1200 : timeA - 
                    (b.time.includes('PM') && !b.time.includes('12:') ? timeB + 1200 : timeB);
            });
          }
        });
        
        setItinerary(updatedItinerary);
      }
    }
  }, [selectedAttractions, loading, itinerary]);

  const getActivityIcon = (iconName: string) => {
    switch(iconName) {
      case 'plane': return <Plane className="h-5 w-5" />;
      case 'car': return <Car className="h-5 w-5" />;
      case 'bed': return <Bed className="h-5 w-5" />;
      case 'camera': return <Camera className="h-5 w-5" />;
      case 'utensils': return <Utensils className="h-5 w-5" />;
      case 'temple': return <Building className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'transport': return 'bg-blue-100 text-blue-700';
      case 'accommodation': return 'bg-purple-100 text-purple-700';
      case 'attraction': return 'bg-green-100 text-green-700';
      case 'food': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCustomizeActivity = (dayIdx: number, activityId: string) => {
    toast.success('Activity customization feature will be available soon!');
  };

  const handleShuffleActivities = (dayIdx: number) => {
    const newItinerary = [...itinerary];
    // Shuffle activities while keeping time-specific ones (like flights) in place
    const timeSpecificTypes = ['transport', 'accommodation'];
    
    const fixedActivities = newItinerary[dayIdx].activities.filter(
      act => timeSpecificTypes.includes(act.type)
    );
    
    const flexibleActivities = newItinerary[dayIdx].activities.filter(
      act => !timeSpecificTypes.includes(act.type)
    );
    
    // Fisher-Yates shuffle for flexible activities
    for (let i = flexibleActivities.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flexibleActivities[i], flexibleActivities[j]] = [flexibleActivities[j], flexibleActivities[i]];
    }
    
    // Merge back in order of time
    newItinerary[dayIdx].activities = [...fixedActivities, ...flexibleActivities].sort((a, b) => {
      // Convert times to comparable values (e.g., "09:00 AM" to 900)
      const timeA = parseInt(a.time.replace(/[^0-9]/g, ''));
      const timeB = parseInt(b.time.replace(/[^0-9]/g, ''));
      return a.time.includes('PM') && !a.time.includes('12:') ? timeA + 1200 : timeA - 
             (b.time.includes('PM') && !b.time.includes('12:') ? timeB + 1200 : timeB);
    });
    
    setItinerary(newItinerary);
    toast.success(`Day ${dayIdx + 1} activities rearranged!`);
  };

  const handlePrintItinerary = () => {
    toast.success('Preparing PDF for print...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleLanguageToggle = () => {
    setLanguagePreference(prev => prev === "english" ? "hindi" : "english");
    toast.success(languagePreference === "english" 
      ? "भाषा प्राथमिकता हिंदी में बदली गई!" 
      : "Language preference changed to English!");
  };

  const toggleLanguageText = languagePreference === "english" ? "हिंदी में देखें" : "View in English";
  
  const handleShareViaWhatsApp = () => {
    // Create a simplified text version of the itinerary
    let itineraryText = "📅 *My India Travel Itinerary* 📅\n\n";
    
    itinerary.forEach(day => {
      itineraryText += `*Day ${day.day} - ${day.date}*\n`;
      day.activities.forEach(activity => {
        itineraryText += `• ${activity.time} - ${activity.title}\n`;
      });
      itineraryText += '\n';
    });
    
    itineraryText += "🧳 *Generated with AI Travel Planner* 🧳";
    
    // Encode for WhatsApp
    const encodedText = encodeURIComponent(itineraryText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp sharing...');
  };

  // Add the missing handleRemoveSelectedItem function
  const handleRemoveSelectedItem = (itemId: string) => {
    if (itemId.startsWith('flight-') && selectedFlight) {
      selectFlight(null);
      toast.info('Flight removed from itinerary');
    } 
    else if (itemId.startsWith('hotel-') && selectedHotel) {
      selectHotel(null);
      toast.info('Hotel removed from itinerary');
    } 
    else if (itemId.startsWith('attraction-')) {
      const attractionId = Number(itemId.replace('attraction-', ''));
      removeAttraction(attractionId);
      toast.info('Attraction removed from itinerary');
    }
    
    // Update the itinerary by filtering out the removed item
    setItinerary(prev => {
      return prev.map(day => ({
        ...day,
        activities: day.activities.filter(activity => activity.id !== itemId)
      }));
    });
  };

  // Calculate showPricing variable which was used in the attractions effect
  const showPricing = 'indian';

  // Loading skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-y-3 mb-4">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <Skeleton className="h-20 w-full mb-6" />
        
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3 mb-8">
            <Skeleton className="h-8 w-32 mb-2" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(j => (
                <Skeleton key={j} className="h-32 w-full" />
              ))}
            </div>
          </div>
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

  // Calculate total cost including selected items
  const calculateTotalCost = () => {
    let total = itinerary.reduce((total, day) => {
      return total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0);
    }, 0);

    return total;
  };

  // Selected items section
  const renderSelectedItemsSection = () => {
    const hasSelectedItems = selectedFlight || selectedHotel || selectedAttractions.length > 0;
    
    if (!hasSelectedItems) return null;
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-lg mb-3">Your Selected Items</h4>
        <div className="grid grid-cols-1 gap-3">
          {selectedFlight && (
            <Card className="overflow-hidden bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-blue-100 rounded-full mr-2">
                      <Plane className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{selectedFlight.airline} - {selectedFlight.flightNumber}</h5>
                      <p className="text-xs text-muted-foreground">
                        {selectedFlight.departureCity} to {selectedFlight.arrivalCity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {selectedFlight.price.toLocaleString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full hover:bg-blue-200" 
                      onClick={() => handleRemoveSelectedItem(`flight-${selectedFlight.id}`)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {selectedHotel && (
            <Card className="overflow-hidden bg-purple-50 border-purple-200">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-purple-100 rounded-full mr-2">
                      <Bed className="h-4 w-4 text-purple-700" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{selectedHotel.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {selectedHotel.address.substring(0, 40)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {selectedHotel.price.toLocaleString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full hover:bg-purple-200" 
                      onClick={() => handleRemoveSelectedItem(`hotel-${selectedHotel.id}`)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {selectedAttractions.length > 0 && (
            <div className="space-y-2">
              {selectedAttractions.map(attraction => (
                <Card key={`selected-${attraction.id}`} className="overflow-hidden bg-green-50 border-green-200">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-green-100 rounded-full mr-2">
                          <Camera className="h-4 w-4 text-green-700" />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{attraction.name}</h5>
                          <p className="text-xs text-muted-foreground">
                            {attraction.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium flex items-center">
                          <IndianRupee className="h-3 w-3" />
                          {attraction.priceIndian.toLocaleString()}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full hover:bg-green-200" 
                          onClick={() => handleRemoveSelectedItem(`attraction-${attraction.id}`)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-y-3">
        <div>
          <h3 className="text-xl font-semibold">
            {itinerary.length}-Day {itinerary.length > 0 && itinerary[0].date ? new Date(itinerary[0].date).toLocaleString('en-US', { month: 'short' }) : ''} Exploration
          </h3>
          <p className="text-sm text-muted-foreground">
            {itinerary.length > 0 ? 
              `${itinerary[0].date} - ${itinerary[itinerary.length-1].date}` : 
              "Custom Itinerary"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleLanguageToggle}>
            {toggleLanguageText}
          </Button>
          <Button variant="outline" onClick={handleShareViaWhatsApp}>
            Share via WhatsApp
          </Button>
          <Button variant="outline" onClick={handlePrintItinerary}>
            Print Itinerary
          </Button>
        </div>
      </div>

      {renderSelectedItemsSection()}

      <div className="bg-muted/30 p-3 rounded-md flex flex-wrap justify-between gap-y-3">
        <div>
          <span className="text-sm font-medium">Total Estimated Cost</span>
          <div className="flex items-center text-2xl font-bold">
            <IndianRupee className="h-5 w-5 mr-1" />
            {calculateTotalCost().toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">Activities</span>
          <div className="text-lg">{itinerary.reduce((count, day) => count + day.activities.length, 0)}</div>
        </div>
      </div>
      
      <div className="space-y-8">
        {itinerary.map((day, dayIdx) => (
          <div key={`day-${day.day}`} className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-lg flex items-center">
                Day {day.day} <span className="text-sm font-normal text-muted-foreground ml-2">{day.date}</span>
              </h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleShuffleActivities(dayIdx)}
                className="h-8"
              >
                <Shuffle className="mr-1 h-4 w-4" />
                Shuffle
              </Button>
            </div>
            
            <div className="space-y-4 relative before:absolute before:left-[22px] before:top-0 before:h-full before:w-0.5 before:bg-muted">
              {day.activities.map((activity) => {
                // Check if this is a user-selected item
                const isUserSelected = 
                  (activity.id.startsWith('flight-') && selectedFlight) ||
                  (activity.id.startsWith('hotel-') && selectedHotel) ||
                  (activity.id.startsWith('attraction-') && 
                    selectedAttractions.some(attr => `attraction-${attr.id}` === activity.id));
                
                return (
                  <div key={activity.id} className="pl-12 relative">
                    {/* Time indicator and icon */}
                    <div className="absolute left-0 top-0 flex flex-col items-center">
                      <div className="text-xs font-medium mb-1">{activity.time}</div>
                      <div className={`rounded-full p-1.5 z-10 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.icon)}
                      </div>
                    </div>
                    
                    {/* Activity content */}
                    <div className={`border p-3 rounded-lg hover:shadow-sm transition-shadow ${
                      isUserSelected ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}>
                      <div className="flex justify-between">
                        <h5 className="font-medium">{activity.title}</h5>
                        <div className="flex">
                          {isUserSelected && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 mr-1" 
                              onClick={() => handleRemoveSelectedItem(activity.id)}
                            >
                              <X className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => handleCustomizeActivity(dayIdx, activity.id)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      
                      {activity.notes && (
                        <div className="mt-1.5 bg-amber-50 p-1.5 rounded-sm text-xs text-amber-700">
                          {activity.notes}
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-1.5 text-xs">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>Duration: ~2 hours</span>
                        </div>
                        {activity.cost > 0 && (
                          <div className="flex items-center font-medium">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            <span>{activity.cost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-700">
        <h4 className="font-medium mb-2">Important Travel Notes</h4>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Dress conservatively for temple visits (shoulders and knees covered)</li>
          <li>Remove shoes before entering temples and some historic sites</li>
          <li>Carry bottled water and stay hydrated, especially during summer</li>
          <li>Keep a copy of your ID/passport with you at all times</li>
          <li>Most places accept credit cards, but carry cash for small vendors</li>
          <li>Delhi summer (April-June) can be extremely hot; plan indoor activities mid-day</li>
        </ul>
      </div>
    </div>
  );
};

export default ItineraryResults;
