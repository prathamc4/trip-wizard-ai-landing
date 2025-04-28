import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Shuffle, Clock, MapPin, Bed, Coffee, Camera, Car, Plane } from 'lucide-react';
import { toast } from 'sonner';

// Sample itinerary data
const itineraryData = [
  {
    day: 1,
    date: 'May 15, 2025',
    activities: [
      {
        id: '1-1',
        time: '09:00 AM',
        type: 'transport',
        title: 'Flight to Los Angeles',
        description: 'SkyWays Airlines (SW 1234), JFK to LAX',
        icon: 'plane',
        cost: 349
      },
      {
        id: '1-2',
        time: '12:30 PM',
        type: 'transport',
        title: 'Airport Transfer',
        description: 'Shuttle from LAX to Grand Plaza Hotel',
        icon: 'car',
        cost: 25
      },
      {
        id: '1-3',
        time: '02:00 PM',
        type: 'accommodation',
        title: 'Hotel Check-in',
        description: 'Grand Plaza Hotel, Standard Double Room',
        icon: 'bed',
        cost: 189
      },
      {
        id: '1-4',
        time: '04:00 PM',
        type: 'attraction',
        title: 'Hollywood Walk of Fame',
        description: 'Self-guided tour of the famous Hollywood stars',
        icon: 'camera',
        cost: 0
      },
      {
        id: '1-5',
        time: '07:00 PM',
        type: 'food',
        title: 'Dinner at Urban Bistro',
        description: 'Popular local restaurant with California cuisine',
        icon: 'coffee',
        cost: 65
      }
    ]
  },
  {
    day: 2,
    date: 'May 16, 2025',
    activities: [
      {
        id: '2-1',
        time: '08:30 AM',
        type: 'food',
        title: 'Breakfast at hotel',
        description: 'Continental breakfast included with stay',
        icon: 'coffee',
        cost: 0
      },
      {
        id: '2-2',
        time: '10:00 AM',
        type: 'attraction',
        title: 'Universal Studios Tour',
        description: 'Full day at Universal Studios theme park',
        icon: 'camera',
        cost: 129
      },
      {
        id: '2-3',
        time: '06:00 PM',
        type: 'transport',
        title: 'Return transfer',
        description: 'Shuttle from Universal Studios to hotel',
        icon: 'car',
        cost: 20
      },
      {
        id: '2-4',
        time: '08:00 PM',
        type: 'food',
        title: 'Dinner at Skyview Restaurant',
        description: 'Rooftop restaurant with panoramic city views',
        icon: 'coffee',
        cost: 85
      }
    ]
  },
  {
    day: 3,
    date: 'May 17, 2025',
    activities: [
      {
        id: '3-1',
        time: '09:00 AM',
        type: 'attraction',
        title: 'Santa Monica Pier',
        description: 'Visit the iconic beach and pier',
        icon: 'camera',
        cost: 0
      },
      {
        id: '3-2',
        time: '01:00 PM',
        type: 'food',
        title: 'Lunch at Beachside Café',
        description: 'Casual seafood restaurant with ocean views',
        icon: 'coffee',
        cost: 45
      },
      {
        id: '3-3',
        time: '03:00 PM',
        type: 'transport',
        title: 'Return to hotel',
        description: 'Taxi from Santa Monica to Grand Plaza Hotel',
        icon: 'car',
        cost: 35
      },
      {
        id: '3-4',
        time: '07:00 PM',
        type: 'food',
        title: 'Farewell Dinner',
        description: 'Fine dining experience at The Grand Restaurant',
        icon: 'coffee',
        cost: 95
      }
    ]
  }
];

const ItineraryResults: React.FC = () => {
  const [itinerary, setItinerary] = useState(itineraryData);

  const getActivityIcon = (iconName: string) => {
    switch(iconName) {
      case 'plane': return <Plane className="h-5 w-5" />;
      case 'car': return <Car className="h-5 w-5" />;
      case 'bed': return <Bed className="h-5 w-5" />;
      case 'camera': return <Camera className="h-5 w-5" />;
      case 'coffee': return <Coffee className="h-5 w-5" />;
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

  // Calculate total cost
  const totalCost = itinerary.reduce((total, day) => {
    return total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">3-Day Los Angeles Adventure</h3>
          <p className="text-sm text-muted-foreground">May 15 - 17, 2025</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintItinerary}>
            Print Itinerary
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 p-3 rounded-md flex justify-between">
        <div>
          <span className="text-sm font-medium">Total Estimated Cost</span>
          <div className="text-2xl font-bold">${totalCost}</div>
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
              {day.activities.map((activity) => (
                <div key={activity.id} className="pl-12 relative">
                  {/* Time indicator and icon */}
                  <div className="absolute left-0 top-0 flex flex-col items-center">
                    <div className="text-xs font-medium mb-1">{activity.time}</div>
                    <div className={`rounded-full p-1.5 z-10 ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.icon)}
                    </div>
                  </div>
                  
                  {/* Activity content */}
                  <div className="border p-3 rounded-lg hover:shadow-sm transition-shadow bg-white">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{activity.title}</h5>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleCustomizeActivity(dayIdx, activity.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    
                    <div className="flex justify-between mt-1.5 text-xs">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>Duration: ~2 hours</span>
                      </div>
                      {activity.cost > 0 && (
                        <div className="font-medium">${activity.cost}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryResults;
