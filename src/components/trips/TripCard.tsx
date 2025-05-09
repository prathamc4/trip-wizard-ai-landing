import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip } from '@/services/tripService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Trash2, Calendar, MapPin, IndianRupee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

// Define a list of fallback images for destinations
const destinationImages: Record<string, string> = {
  'Delhi': 'https://source.unsplash.com/featured/?delhi,india',
  'Mumbai': 'https://source.unsplash.com/featured/?mumbai,gateway',
  'Bangalore': 'https://source.unsplash.com/featured/?bangalore,garden',
  'Goa': 'https://source.unsplash.com/featured/?goa,beach',
  'Chennai': 'https://source.unsplash.com/featured/?chennai,marina',
  'Kolkata': 'https://source.unsplash.com/featured/?kolkata,howrah',
  'Jaipur': 'https://source.unsplash.com/featured/?jaipur,palace',
  'Agra': 'https://source.unsplash.com/featured/?agra,tajmahal',
  'Varanasi': 'https://source.unsplash.com/featured/?varanasi,ganges',
  'Udaipur': 'https://source.unsplash.com/featured/?udaipur,palace',
  'Kerala': 'https://source.unsplash.com/featured/?kerala,backwaters',
  'Shimla': 'https://source.unsplash.com/featured/?shimla,snow',
  'Manali': 'https://source.unsplash.com/featured/?manali,mountain',
  'Darjeeling': 'https://source.unsplash.com/featured/?darjeeling,tea',
  'Rajasthan': 'https://source.unsplash.com/featured/?rajasthan,desert'
};

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate when the trip was saved
  const savedTimeAgo = formatDistanceToNow(new Date(trip.createdAt), { addSuffix: true });

  // Function to get the best image for the trip
  useEffect(() => {
    const getDestinationImage = () => {
      // First try the provided cover image
      if (trip.coverImage && !imageError) {
        setImageUrl(trip.coverImage);
        return;
      }

      // Otherwise, try to match with our predefined destination images
      const destination = trip.destination.split(',')[0].trim();
      
      // Find a matching destination or closest match
      for (const [key, url] of Object.entries(destinationImages)) {
        if (destination.toLowerCase().includes(key.toLowerCase())) {
          setImageUrl(url);
          return;
        }
      }
      
      // Generic India travel fallback
      setImageUrl(`https://source.unsplash.com/featured/?${encodeURIComponent(trip.destination)},travel,india`);
    };

    getDestinationImage();
  }, [trip.destination, trip.coverImage, imageError]);

  const handleImageError = () => {
    setImageError(true);
    // Fallback to a generic travel image
    setImageUrl(`https://source.unsplash.com/featured/?travel,india`);
  };

  return (
    <Card className="w-full overflow-hidden transition-all duration-300">
      <div className="h-48 w-full overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={trip.destination} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-2xl font-bold">{trip.destination}</h3>
          <div className="flex items-center text-sm mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {trip.duration} {trip.duration === 1 ? 'Day' : 'Days'}
              </Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Saved {savedTimeAgo}
              </Badge>
            </div>
          </div>
          <div className="flex items-center font-bold text-lg">
            <IndianRupee className="h-4 w-4" />
            {trip.totalBudget.toLocaleString()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          {trip.destination}
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">Budget Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-md">
              <span>Accommodation</span>
              <span className="font-medium">₹{trip.budgetBreakdown.accommodation.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-md">
              <span>Activities</span>
              <span className="font-medium">₹{trip.budgetBreakdown.activities.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md">
              <span>Transport</span>
              <span className="font-medium">₹{trip.budgetBreakdown.transportation.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-md">
              <span>Food</span>
              <span className="font-medium">₹{trip.budgetBreakdown.food.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View Details
            </>
          )}
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-1">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your saved trip to {trip.destination}. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(trip.id)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
      
      {expanded && (
        <div className="border-t px-6 py-4">
          <h4 className="font-semibold mb-3">Itinerary Details</h4>
          
          <div className="space-y-6">
            {trip.itinerary.map((day) => (
              <div key={day.day} className="space-y-2">
                <h5 className="font-medium">
                  Day {day.day} - {formatDate(day.date)}
                </h5>
                
                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="p-2 rounded-md bg-gray-50 border text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{activity.time}</span>
                        {activity.cost > 0 && (
                          <span className="text-xs flex items-center">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {activity.cost}
                          </span>
                        )}
                      </div>
                      <div>{activity.activity}</div>
                      {activity.location && (
                        <div className="text-xs text-gray-600 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-0.5" />
                          {activity.location}
                        </div>
                      )}
                      {activity.notes && (
                        <div className="text-xs italic mt-1 text-gray-500">
                          {activity.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {trip.notes && (
            <div className="mt-4 p-3 bg-amber-50 text-sm rounded-md">
              <h5 className="font-medium mb-1">Notes</h5>
              <p>{trip.notes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TripCard;
