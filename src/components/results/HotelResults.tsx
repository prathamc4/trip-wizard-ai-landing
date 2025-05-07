
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Star,
  Wifi,
  MapPin,
  Heart,
  Car,
  Coffee,
  Leaf,
  Fan,
  IndianRupee,
  Loader,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchHotels, HotelResult } from "@/utils/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelection } from "@/context/SelectionContext";

const HotelResults: React.FC = () => {
  const [priceRange, setPriceRange] = useState<number[]>([1000, 20000]);
  const [starFilter, setStarFilter] = useState("all");
  const [vegFilter, setVegFilter] = useState("all");
  const [acFilter, setAcFilter] = useState("all");
  const [savedHotels, setSavedHotels] = useState<number[]>([]);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedHotel, selectHotel } = useSelection();

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve search params from session storage or use defaults
        const searchData = sessionStorage.getItem("travelSearchData");
        let destination = "New Delhi";
        let checkInDate = "2025-05-15";
        let checkOutDate = "2025-05-18";

        if (searchData) {
          const parsedData = JSON.parse(searchData);
          destination = parsedData.destination || destination;

          if (parsedData.startDate) {
            const startDate = new Date(parsedData.startDate);
            checkInDate = startDate.toISOString().split("T")[0];
          }

          if (parsedData.endDate) {
            const endDate = new Date(parsedData.endDate);
            checkOutDate = endDate.toISOString().split("T")[0];
          }
        }

        // Fetch hotels
        const hotelResults = await fetchHotels({
          destination,
          checkInDate,
          checkOutDate,
          adults: 1,
          currency: "INR",
        });

        setHotels(hotelResults);

        // Update price range based on available hotels
        if (hotelResults.length > 0) {
          const prices = hotelResults.map((hotel) => hotel.price);
          const minPrice = Math.floor(Math.min(...prices) / 500) * 500; // Round to lower 500
          const maxPrice = Math.ceil(Math.max(...prices) / 500) * 500; // Round to upper 500
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError("Failed to load hotel data. Please try again later.");
        toast.error("Could not load hotel data");
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  const handleSaveToggle = (hotelId: number) => {
    setSavedHotels((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId]
    );

    if (!savedHotels.includes(hotelId)) {
      toast.success("Hotel saved to favorites!");
    }
  };

  const handleSelectHotel = (hotel: HotelResult) => {
    selectHotel(hotel);
  };

  const isSelected = (hotel: HotelResult) => {
    return selectedHotel?.id === hotel.id;
  };

  // Filter hotels
  const filteredHotels = hotels.filter((hotel) => {
    const matchesPrice =
      hotel.price >= priceRange[0] && hotel.price <= priceRange[1];

    const matchesStars =
      starFilter === "all" ||
      (starFilter === "3plus" && hotel.rating >= 3) ||
      (starFilter === "4plus" && hotel.rating >= 4) ||
      (starFilter === "5only" && hotel.rating === 5);

    const matchesVeg =
      vegFilter === "all" || (vegFilter === "veg" && hotel.vegetarianFriendly);

    const matchesAC =
      acFilter === "all" ||
      (acFilter === "ac" && hotel.amenities.includes("ac")) ||
      (acFilter === "nonac" && !hotel.amenities.includes("ac"));

    return matchesPrice && matchesStars && matchesVeg && matchesAC;
  });

  // Helper for rendering amenity icons
  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "breakfast":
        return <Coffee className="h-4 w-4" />;
      case "ac":
        return <Fan className="h-4 w-4" />;
      case "veg":
        return <Leaf className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  // Helper for rendering star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative w-4 h-4">
          <Star className="absolute w-4 h-4 text-yellow-400" />
          <div className="absolute overflow-hidden w-2 h-4">
            <Star className="absolute w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />
      );
    }

    return stars;
  };

  // Loading skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between gap-4 mb-8">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-44" />
        </div>

        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-72 w-full rounded-lg" />
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
      <div className="flex flex-wrap justify-between gap-4">
        {/* Price range filter */}
        <div className="space-y-2 w-full md:w-64">
          <label className="text-sm font-medium">Price range (₹)</label>
          <Slider
            min={500}
            max={25000}
            step={500}
            value={priceRange}
            onValueChange={setPriceRange}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Star rating filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Star Rating</label>
          <Select value={starFilter} onValueChange={setStarFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="3plus">3+ Stars</SelectItem>
              <SelectItem value="4plus">4+ Stars</SelectItem>
              <SelectItem value="5only">5 Stars Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vegetarian filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dining Options</label>
          <Select value={vegFilter} onValueChange={setVegFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Options</SelectItem>
              <SelectItem value="veg">Vegetarian Friendly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AC/Non-AC filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Room Type</label>
          <Select value={acFilter} onValueChange={setAcFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ac">AC Rooms</SelectItem>
              <SelectItem value="nonac">Non-AC Rooms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredHotels.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No hotels match your current filters.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setStarFilter("all");
              setVegFilter("all");
              setAcFilter("all");
              // Reset price range to initial values
              const prices = hotels.map((hotel) => hotel.price);
              if (prices.length > 0) {
                setPriceRange([
                  Math.floor(Math.min(...prices) / 500) * 500,
                  Math.ceil(Math.max(...prices) / 500) * 500,
                ]);
              }
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredHotels.map((hotel) => {
            const hotelSelected = isSelected(hotel);
            
            return (
              <Card
                key={hotel.id}
                className={`overflow-hidden hover:shadow-md transition-all duration-200 ${
                  hotelSelected ? "ring-2 ring-travel-green" : ""
                }`}
              >
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-3 gap-2">
                    {/* Hotel image carousel */}
                    <div className="md:col-span-1">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {hotel.images.map((image, index) => (
                            <CarouselItem key={index}>
                              <div className="h-52 md:h-full min-h-40 relative">
                                <img
                                  src={image}
                                  alt={`${hotel.name} - image ${index + 1}`}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).onerror = null;
                                    (e.target as HTMLImageElement).src =
                                      "https://placehold.co/600x400/e2e8f0/a0aec0?text=Hotel+Image";
                                  }}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </Carousel>
                    </div>

                    {/* Hotel details */}
                    <div className="p-4 md:col-span-2">
                      <div className="flex justify-between mb-2">
                        <h3 className="text-xl font-bold">{hotel.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveToggle(hotel.id)}
                          className="relative"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              savedHotels.includes(hotel.id)
                                ? "fill-pink-500 text-pink-500"
                                : ""
                            }`}
                          />
                          {savedHotels.includes(hotel.id) && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                            </span>
                          )}
                        </Button>
                      </div>

                      <div className="flex mb-2">
                        {renderStars(hotel.rating)}
                        <span className="text-sm ml-2">{hotel.rating} stars</span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {hotel.address}
                      </div>

                      <div className="text-sm text-blue-600 mb-3">
                        {hotel.distanceFromStation}
                      </div>

                      <p className="text-sm mb-4">{hotel.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.map((amenity) => (
                          <div
                            key={amenity}
                            className="flex items-center bg-muted px-2 py-1 rounded text-xs"
                          >
                            {getAmenityIcon(amenity)}
                            <span className="ml-1 capitalize">{amenity}</span>
                          </div>
                        ))}
                        {hotel.vegetarianFriendly && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <Leaf className="h-3 w-3 mr-1" />
                            Veg Friendly
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap justify-between items-center mt-auto pt-2 border-t">
                        <div>
                          <div className="flex items-baseline">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            <span className="text-2xl font-bold">
                              {hotel.price.toLocaleString()}
                            </span>
                            <span className="text-sm ml-1">per night</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            GST & fees included
                          </p>
                        </div>

                        <Button 
                          className={`mt-2 sm:mt-0 ${
                            hotelSelected ? "bg-green-600 hover:bg-green-700" : ""
                          }`}
                          onClick={() => handleSelectHotel(hotel)}
                        >
                          {hotelSelected ? (
                            <>
                              <Check className="mr-1 h-4 w-4" /> Selected
                            </>
                          ) : (
                            "Book Now"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HotelResults;
