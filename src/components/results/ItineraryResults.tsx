
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Shuffle, Clock, MapPin, Bed, Coffee, Camera, Car, Plane, Temple, IndianRupee, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Sample India-focused itinerary data
const itineraryData = [
  {
    day: 1,
    date: 'May 15, 2025',
    activities: [
      {
        id: '1-1',
        time: '08:15 AM',
        type: 'transport',
        title: 'Flight to New Delhi',
        description: 'Air India (AI 863), Mumbai to New Delhi',
        icon: 'plane',
        cost: 4899,
        notes: 'Terminal 3, Check-in 2 hours before departure'
      },
      {
        id: '1-2',
        time: '10:45 AM',
        type: 'transport',
        title: 'Airport Transfer',
        description: 'Prepaid taxi from IGI Airport to hotel',
        icon: 'car',
        cost: 600,
        notes: 'Prepaid taxi counter at airport arrival area'
      },
      {
        id: '1-3',
        time: '12:00 PM',
        type: 'accommodation',
        title: 'Hotel Check-in',
        description: 'Taj Palace New Delhi, Deluxe Room',
        icon: 'bed',
        cost: 12500,
        notes: 'Early check-in arranged'
      },
      {
        id: '1-4',
        time: '01:30 PM',
        type: 'food',
        title: 'Lunch at Bukhara',
        description: 'Renowned North Indian restaurant with tandoori specialties',
        icon: 'utensils',
        cost: 3500,
        notes: 'Vegetarian options available, casual elegant dress code'
      },
      {
        id: '1-5',
        time: '04:00 PM',
        type: 'attraction',
        title: 'Visit Qutub Minar',
        description: 'UNESCO World Heritage site with 73m tall minaret',
        icon: 'camera',
        cost: 600,
        notes: 'Entry fee: ₹600 for foreigners, ₹35 for Indians'
      },
      {
        id: '1-6',
        time: '07:30 PM',
        type: 'food',
        title: 'Dinner at Karim\'s',
        description: 'Historic restaurant famous for Mughlai cuisine',
        icon: 'utensils',
        cost: 1200,
        notes: 'Busy place, reservation recommended'
      }
    ]
  },
  {
    day: 2,
    date: 'May 16, 2025',
    activities: [
      {
        id: '2-1',
        time: '07:00 AM',
        type: 'food',
        title: 'Breakfast at hotel',
        description: 'Buffet breakfast with Indian and continental options',
        icon: 'utensils',
        cost: 0,
        notes: 'Included with stay'
      },
      {
        id: '2-2',
        time: '09:00 AM',
        type: 'attraction',
        title: 'Visit Red Fort',
        description: 'Historic fort that served as the main residence of the Mughal Emperors',
        icon: 'camera',
        cost: 600,
        notes: 'Entry fee: ₹600 for foreigners, ₹35 for Indians. Closed on Mondays.'
      },
      {
        id: '2-3',
        time: '12:30 PM',
        type: 'food',
        title: 'Lunch at Paranthe Wali Gali',
        description: 'Famous lane in Old Delhi known for traditional stuffed parathas',
        icon: 'utensils',
        cost: 400,
        notes: 'Street food experience, multiple small shops'
      },
      {
        id: '2-4',
        time: '02:30 PM',
        type: 'attraction',
        title: 'Visit India Gate & Rashtrapati Bhavan',
        description: 'War memorial and Presidential Residence with changing of guard ceremony',
        icon: 'camera',
        cost: 0,
        notes: 'Free entry, special pass needed for Rashtrapati Bhavan interior'
      },
      {
        id: '2-5',
        time: '06:00 PM',
        type: 'attraction',
        title: 'Visit Akshardham Temple',
        description: 'Magnificent Hindu temple complex with evening water show',
        icon: 'temple',
        cost: 0,
        notes: 'Free entry, ₹80 for water show. No cameras allowed inside.'
      },
      {
        id: '2-6',
        time: '08:30 PM',
        type: 'food',
        title: 'Dinner at Indian Accent',
        description: 'Modern Indian cuisine at one of India\'s top restaurants',
        icon: 'utensils',
        cost: 4500,
        notes: 'Fine dining, reservation essential'
      }
    ]
  },
  {
    day: 3,
    date: 'May 17, 2025',
    activities: [
      {
        id: '3-1',
        time: '07:00 AM',
        type: 'food',
        title: 'Breakfast at hotel',
        description: 'Buffet breakfast with Indian and continental options',
        icon: 'utensils',
        cost: 0,
        notes: 'Included with stay'
      },
      {
        id: '3-2',
        time: '09:00 AM',
        type: 'attraction',
        title: 'Visit Humayun\'s Tomb',
        description: 'UNESCO World Heritage site and architectural inspiration for Taj Mahal',
        icon: 'camera',
        cost: 600,
        notes: 'Entry fee: ₹600 for foreigners, ₹35 for Indians'
      },
      {
        id: '3-3',
        time: '12:00 PM',
        type: 'food',
        title: 'Lunch at Sagar Ratna',
        description: 'Popular South Indian vegetarian restaurant',
        icon: 'utensils',
        cost: 800,
        notes: 'Known for dosas, idlis and South Indian thalis'
      },
      {
        id: '3-4',
        time: '02:00 PM',
        type: 'attraction',
        title: 'Shopping at Dilli Haat',
        description: 'Crafts bazaar featuring handcrafts from all over India',
        icon: 'camera',
        cost: 60,
        notes: 'Entry fee: ₹60 for adults, bring cash for shopping'
      },
      {
        id: '3-5',
        time: '06:00 PM',
        type: 'transport',
        title: 'Return to hotel',
        description: 'Taxi from Dilli Haat to Taj Palace Hotel',
        icon: 'car',
        cost: 300,
        notes: 'Use Uber or Ola app for reliable service'
      },
      {
        id: '3-6',
        time: '07:30 PM',
        type: 'food',
        title: 'Farewell Dinner',
        description: 'Authentic Punjabi dinner at Punjabi by Nature',
        icon: 'utensils',
        cost: 2500,
        notes: 'Known for butter chicken and dal makhani'
      }
    ]
  }
];

const ItineraryResults: React.FC = () => {
  const [itinerary, setItinerary] = useState(itineraryData);
  const [languagePreference, setLanguagePreference] = useState("english");

  const getActivityIcon = (iconName: string) => {
    switch(iconName) {
      case 'plane': return <Plane className="h-5 w-5" />;
      case 'car': return <Car className="h-5 w-5" />;
      case 'bed': return <Bed className="h-5 w-5" />;
      case 'camera': return <Camera className="h-5 w-5" />;
      case 'utensils': return <Utensils className="h-5 w-5" />;
      case 'temple': return <Temple className="h-5 w-5" />;
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

  // Calculate total cost
  const totalCost = itinerary.reduce((total, day) => {
    return total + day.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-y-3">
        <div>
          <h3 className="text-xl font-semibold">3-Day Delhi Exploration</h3>
          <p className="text-sm text-muted-foreground">May 15 - 17, 2025</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleLanguageToggle}>
            {toggleLanguageText}
          </Button>
          <Button variant="outline" onClick={handlePrintItinerary}>
            Print Itinerary
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 p-3 rounded-md flex flex-wrap justify-between gap-y-3">
        <div>
          <span className="text-sm font-medium">Total Estimated Cost</span>
          <div className="flex items-center text-2xl font-bold">
            <IndianRupee className="h-5 w-5 mr-1" />
            {totalCost.toLocaleString()}
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
              ))}
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
