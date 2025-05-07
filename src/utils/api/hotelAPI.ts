/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";

export interface HotelSearchParams {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  currency?: string;
}

export interface HotelResult {
  id: number;
  name: string;
  rating: number;
  price: number;
  address: string;
  amenities: string[];
  vegetarianFriendly: boolean;
  distanceFromStation: string;
  description: string;
  images: string[];
}

export const fetchHotels = async (
  params: HotelSearchParams
): Promise<HotelResult[]> => {
  try {
    console.log("Fetching hotel data with params:", params);

    // Get the API key from environment variables
    const apiKey = import.meta.env.VITE_SERPAPI_KEY;
    if (!apiKey) {
      throw new Error("SerpAPI key not found in environment variables");
    }

    // Use our backend server to avoid CORS issues
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
    const apiUrl = `${backendUrl}/api/hotels?destination=${encodeURIComponent(
      params.destination
    )}&checkInDate=${params.checkInDate}&checkOutDate=${
      params.checkOutDate
    }&adults=${params.adults || 2}&currency=${
      params.currency || "INR"
    }&key=${apiKey}`;

    console.log("Making API request to backend for hotel data");

    // Make the request to our backend server
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend API Error:", response.status, errorText);
      throw new Error(`Backend API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Backend response received for hotels ", data);

    // Transform the API response to our format
    const transformedData = transformSerpAPIHotelResponse(data, params);

    // Cache the transformed data
    return transformedData;
  } catch (error) {
    console.error("Error fetching hotel data:", error);

    // Fall back to sample data on error
    const fallbackData = getSampleHotelData(params);
    toast.error(
      "Network error when fetching hotels. Showing sample results instead."
    );
    toast("API Error: " + error.message, {
      description: "Using sample data instead. Check console for details.",
    });

    return fallbackData;
  }
};

// Transform SerpAPI Google Hotels response to our format
function transformSerpAPIHotelResponse(
  apiResponse: any,
  params: HotelSearchParams
): HotelResult[] {
  try {
    if (!apiResponse.properties) {
      throw new Error("No hotel results found in SerpAPI response");
    }

    const hotels = apiResponse.properties;

    return hotels.slice(0, 10).map((hotel: any, index: number) => {
      // Images
      const images: string[] = [];

      if (hotel.images && Array.isArray(hotel.images)) {
        hotel.images.slice(0, 6).forEach((img: any) => {
          if (img.original_image) {
            images.push(img.original_image);
          } else if (img.thumbnail) {
            images.push(img.thumbnail);
          }
        });
      }

      // Fallback image only if no real images are available
      if (images.length === 0) {
        images.push(
          "https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400"
        );
      }
      console.log(hotel.images);

      // Amenities
      const rawAmenities = hotel.amenities || [];
      const amenities = [
        rawAmenities.includes("Free Wi-Fi") || rawAmenities.includes("Wi-Fi")
          ? "wifi"
          : null,
        rawAmenities.includes("Free parking") ||
        rawAmenities.includes("Parking")
          ? "parking"
          : null,
        rawAmenities.some(
          (a) =>
            a.toLowerCase().includes("breakfast") ||
            a.toLowerCase().includes("restaurant")
        )
          ? "breakfast"
          : null,
        rawAmenities.includes("Air conditioning") ? "ac" : null,
        rawAmenities.some((a) => a.toLowerCase().includes("pool"))
          ? "pool"
          : null,
        rawAmenities.includes("Gym") || rawAmenities.includes("Fitness center")
          ? "gym"
          : null,
      ].filter(Boolean);

      if (amenities.length === 0) {
        if (Math.random() > 0.2) amenities.push("wifi");
        if (Math.random() > 0.4) amenities.push("ac");
      }

      // Vegetarian friendly
      const isVegFriendly =
        rawAmenities.includes("Vegetarian meals") ||
        hotel.description?.toLowerCase().includes("vegetarian") ||
        Math.random() > 0.3;

      // Distance
      const distanceKm = hotel.distance_from_center
        ? parseFloat(hotel.distance_from_center.replace(/[^\d.]/g, ""))
        : (Math.random() * 6 + 0.5).toFixed(1);

      const stationType =
        Math.random() > 0.5 ? "Railway Station" : "Metro Station";
      const nearestStation = `${distanceKm} km from nearest ${stationType}`;

      // Rating
      let rating = hotel.overall_rating || hotel.rating || 0;
      if (typeof rating === "string") rating = parseFloat(rating);
      if (rating > 5) rating = rating / 2;
      if (!rating) rating = Math.floor(Math.random() * 2) + 3;

      // Price
      const priceString =
        hotel.rate_per_night?.lowest || hotel.total_rate?.lowest;
      const price = priceString
        ? parseInt(priceString.replace(/[^\d]/g, ""))
        : 2000 + Math.floor(Math.random() * 8000);

      return {
        id: index + 1,
        name: hotel.name || `Hotel ${index + 1}`,
        rating,
        price,
        address: hotel.address || `${params.destination}, India`,
        amenities,
        vegetarianFriendly: isVegFriendly,
        distanceFromStation: nearestStation,
        description:
          hotel.description ||
          hotel.deal_description ||
          `Great stay at ${params.destination}.`,
        images,
        link: hotel.link || hotel.serpapi_property_details_link || "",
      };
    });
  } catch (error) {
    console.error("Error transforming hotel data:", error);
    return getSampleHotelData(params);
  }
}

// Sample data as fallback - enhanced with destination-specific data
function getSampleHotelData(
  params: HotelSearchParams = {
    destination: "New Delhi",
    checkInDate: "2025-05-15",
    checkOutDate: "2025-05-18",
  }
): HotelResult[] {
  // Extract destination to provide more relevant sample data
  const destination = params.destination || "New Delhi";

  return [
    {
      id: 1,
      name: `Luxury Palace ${destination}`,
      rating: 5,
      price: 12500,
      address: `Downtown, ${destination}, India`,
      amenities: ["wifi", "parking", "breakfast", "ac", "pool", "gym"],
      vegetarianFriendly: true,
      distanceFromStation: `4.5 km from ${destination} Railway Station`,
      description: `Luxury 5-star hotel in ${destination} with elegant rooms, multiple dining options, and excellent service.`,
      images: [
        "https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=600&h=400",
      ],
    },
    {
      id: 2,
      name: `OYO Townhouse ${destination}`,
      rating: 3,
      price: 2299,
      address: `Central Area, ${destination}, India`,
      amenities: ["wifi", "ac", "breakfast"],
      vegetarianFriendly: true,
      distanceFromStation: `1.2 km from ${destination} Metro Station`,
      description: `Budget-friendly hotel in ${destination} with clean rooms and essential amenities for travelers.`,
      images: [
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400",
      ],
    },
    {
      id: 3,
      name: `Grand Royal ${destination}`,
      rating: 5,
      price: 18500,
      address: `Diplomatic Area, ${destination}, India`,
      amenities: ["wifi", "parking", "breakfast", "ac", "pool", "spa", "gym"],
      vegetarianFriendly: true,
      distanceFromStation: `7 km from ${destination} Railway Station`,
      description: `Opulent 5-star hotel in ${destination} with royal decor, world-class dining, and impeccable service.`,
      images: [
        "https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400",
      ],
    },
    {
      id: 4,
      name: `Hotel Central ${destination}`,
      rating: 3,
      price: 1899,
      address: `Near Market, ${destination}, India`,
      amenities: ["wifi", "ac"],
      vegetarianFriendly: true,
      distanceFromStation: `0.5 km from ${destination} Railway Station`,
      description: `Convenient budget hotel close to the railway station in ${destination} with basic amenities.`,
      images: [
        "https://images.unsplash.com/photo-1518877593221-1f28583780b4?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1469041797191-50ace28483c3?fit=crop&w=600&h=400",
        "https://images.unsplash.com/photo-1472396961693-142e6e269027?fit=crop&w=600&h=400",
      ],
    },
  ];
}
