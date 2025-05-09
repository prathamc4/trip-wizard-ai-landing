
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

const SaveTripButton = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const { hasUserSelections, saveCurrentItinerary, totalBudget } = useItinerary();
  
  // Function to handle saving the itinerary
  const handleSaveTrip = async (itineraryDays: any[]) => {
    try {
      setIsSaving(true);
      const tripId = await saveCurrentItinerary(itineraryDays, notes);
      
      if (tripId) {
        toast.success(
          <div>
            <p>Itinerary saved successfully!</p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm text-blue-500 hover:text-blue-700"
              onClick={() => navigate('/my-trips')}
            >
              View all saved trips
            </Button>
          </div>,
          { duration: 5000 }
        );
        setIsOpen(false);
      } else {
        toast.error('Failed to save itinerary');
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      toast.error('Something went wrong while saving');
    } finally {
      setIsSaving(false);
    }
  };

  // Get itinerary days from the page
  const getCurrentItineraryDays = (): any[] => {
    // This is a simplified version - in a real app, you'd get this data 
    // from your itinerary state or API
    const itineraryElements = document.querySelectorAll('[data-day]');
    const days: any[] = [];
    
    itineraryElements.forEach((element) => {
      const dayNumber = parseInt(element.getAttribute('data-day') || '0');
      const dateText = element.querySelector('[data-date]')?.textContent || '';
      
      const activities: any[] = [];
      element.querySelectorAll('[data-activity]').forEach((activityEl) => {
        const time = activityEl.querySelector('[data-time]')?.textContent || '';
        const title = activityEl.querySelector('[data-title]')?.textContent || '';
        const description = activityEl.querySelector('[data-description]')?.textContent || '';
        const cost = parseFloat(activityEl.querySelector('[data-cost]')?.getAttribute('data-cost-value') || '0');
        const type = activityEl.getAttribute('data-activity-type') || '';
        const icon = activityEl.getAttribute('data-activity-icon') || '';
        const notes = activityEl.querySelector('[data-notes]')?.textContent || '';
        
        activities.push({
          time,
          title,
          description,
          cost,
          type,
          icon,
          notes
        });
      });
      
      days.push({
        day: dayNumber,
        date: dateText,
        activities
      });
    });
    
    // If no days were found in the DOM, create a dummy day with minimal data
    if (days.length === 0) {
      // Get search data from sessionStorage
      const searchData = sessionStorage.getItem('travelSearchData');
      let startDate = new Date().toISOString().split('T')[0];
      
      if (searchData) {
        try {
          const parsedData = JSON.parse(searchData);
          if (parsedData.startDate) {
            startDate = parsedData.startDate;
          }
        } catch (e) {
          console.error('Error parsing search data:', e);
        }
      }
      
      days.push({
        day: 1,
        date: startDate,
        activities: []
      });
    }
    
    return days;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={hasUserSelections ? "default" : "outline"}
          disabled={!hasUserSelections}
          className={hasUserSelections ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <Bookmark className="mr-1.5 h-4 w-4" />
          Save Itinerary
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Travel Itinerary</DialogTitle>
          <DialogDescription>
            Save your current itinerary to access it anytime from your "My Trips" page.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-5 bg-blue-50 p-3 rounded-md text-sm">
            <h4 className="font-medium text-blue-700 mb-1">Itinerary Summary</h4>
            <div className="grid grid-cols-2 gap-y-1 gap-x-4">
              <div className="text-muted-foreground">Total Budget:</div>
              <div className="font-medium">₹{totalBudget.toLocaleString()}</div>
              
              <div className="text-muted-foreground">Selected Items:</div>
              <div className="font-medium">{hasUserSelections ? 'Custom selections' : 'Default itinerary'}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="font-medium text-sm">
              Add Notes (Optional)
            </label>
            <Textarea 
              id="notes"
              placeholder="Add any special requirements, preferences, or notes about this trip..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={() => handleSaveTrip(getCurrentItineraryDays())}
            disabled={isSaving}
            className="gap-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <BookmarkCheck className="mr-1 h-4 w-4" />
                Save Trip
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTripButton;
