import { toast } from "sonner";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults?: number;
  currency?: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  departureAirport: string;
  departureCity: string;
  arrivalAirport: string;
  arrivalCity: string;
  price: number;
  direct: boolean;
  layoverAirport?: string;
  layoverCity?: string;
  layoverDuration?: string;
  baggageAllowance: string;
  amenities: string[];
  logo: string;
}

// Cache mechanism to avoid redundant API calls
const cache: Record<string, { data: FlightResult[]; timestamp: number }> = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Backend server URL - will need to be updated based on deployment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const fetchFlights = async (
  params: FlightSearchParams
): Promise<FlightResult[]> => {
  const cacheKey = JSON.stringify(params);
  const now = Date.now();

  // Return cached data if available and not expired
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    return cache[cacheKey].data;
  }

  try {
    // Check if we have a Serpapi key
    const apiKey = import.meta.env.VITE_SERPAPI_KEY;

    if (!apiKey) {
      console.warn("SerpAPI key not found in environment variables");
      throw new Error("SerpAPI key not found");
    }

    // Standardize airport codes based on city name
    let origin = params.origin;
    let destination = params.destination;

    // Convert common Indian cities to airport codes
    const airportCodes: Record<string, string> = {
      Agra: "AGR",
      Ahmedabad: "AMD",
      Amritsar: "ATQ",
      Aurangabad: "IXU",
      Bagdogra: "IXB",
      Bangalore: "BLR",
      Belgaum: "IXG",
      Bhopal: "BHO",
      Bhubaneswar: "BBI",
      Chandigarh: "IXC",
      Chennai: "MAA",
      Coimbatore: "CJB",
      Dehradun: "DED",
      Delhi: "DEL",
      Dibrugarh: "DIB",
      Dimapur: "DMU",
      Durgapur: "RDP",
      Goa: "GOI",
      Gorakhpur: "GOP",
      Guwahati: "GAU",
      Gwalior: "GWL",
      Hubli: "HBX",
      Hyderabad: "HYD",
      Imphal: "IMF",
      Indore: "IDR",
      Itanagar: "HGI", // Hollongi Greenfield Airport
      Jabalpur: "JLR",
      Jaipur: "JAI",
      Jammu: "IXJ",
      Jamshedpur: "IXW",
      Jodhpur: "JDH",
      Kannur: "CNN",
      Kanpur: "KNU",
      Kochi: "COK",
      Kozhikode: "CCJ",
      Kolkata: "CCU",
      Leh: "IXL",
      Lucknow: "LKO",
      Madurai: "IXM",
      Mangalore: "IXE",
      Mumbai: "BOM",
      Mysore: "MYQ",
      Nagpur: "NAG",
      "New Delhi": "DEL",
      Patna: "PAT",
      "Port Blair": "IXZ",
      Pune: "PNQ",
      Raipur: "RPR",
      Rajahmundry: "RJA",
      Rajkot: "RAJ",
      Ranchi: "IXR",
      Shillong: "SHL",
      Shimla: "SLV",
      Silchar: "IXS",
      Srinagar: "SXR",
      Surat: "STV",
      Tezpur: "TEZ",
      Thiruvananthapuram: "TRV",
      Tiruchirappalli: "TRZ",
      Tirupati: "TIR",
      Tuticorin: "TCR",
      Udaipur: "UDR",
      Vadodara: "BDQ",
      Varanasi: "VNS",
      Vijayawada: "VGA",
      Vishakhapatnam: "VTZ",
    };

    // Attempt to convert city names to airport codes
    if (airportCodes[origin]) origin = airportCodes[origin];
    if (airportCodes[destination]) destination = airportCodes[destination];

    // Construct the URL for the backend API
    const backendUrl = `${BACKEND_URL}/api/flights?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&date=${
      params.departureDate
    }&return=${params.returnDate}&currency=${
      params.currency || "INR"
    }&key=${apiKey}`;

    try {
      // First attempt to use the backend server
      const response = await fetch(backendUrl);

      if (!response.ok) {
        throw new Error(`Backend server returned status ${response.status}`);
      }

      const data = await response.json();

      const transformedData = transformSerpAPIResponse(data, params);
      return transformedData;
    } catch (backendError) {
      console.warn("Backend request failed:", backendError);
      toast.warning("Using sample flight data as backend connection failed", {
        description: "Please check that the backend server is running.",
        duration: 5000,
      });

      // Fall back to sample data
      const sampleData = getSampleFlightData(params);
      return sampleData;
    }
  } catch (error) {
    console.error("Error fetching flight data:", error);

    // Fall back to sample data on error
    const fallbackData = getSampleFlightData(params);
    toast.error(
      "Network error when fetching flights. Showing sample results instead."
    );

    return fallbackData;
  }
};
function transformSerpAPIResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiResponse: any,
  params: FlightSearchParams
): FlightResult[] {
  try {
    if (!apiResponse.best_flights) {
      throw new Error("No flight results found in SerpAPI response");
    }

    const flightData = apiResponse.best_flights;
    return (
      flightData
        .slice(0, -1)
        .slice(0, 10)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((flight: any, index: number) => {
          const firstLeg = flight.flights[0]; // assuming at least one flight leg

          const departureInfo = firstLeg.departure_airport || {};
          const arrivalInfo = firstLeg.arrival_airport || {};

          const duration = firstLeg.duration || "Unknown";

          const logo =
            firstLeg.airline_logo ||
            `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${firstLeg.airline
              ?.toLowerCase()
              .replace(/\s+/g, "")}.com&size=64`;
          const minutes = flight.flights[0].duration || 0;
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          const formattedDuration = `${hours}h${remainingMinutes}min`;

          return {
            id: `flight-${index + 1}`,
            airline: firstLeg.airline || "Unknown Airline",
            flightNumber: firstLeg.flight_number || `FL${1000 + index}`,
            departureTime:
              (departureInfo.time || "Unknown").split(" ")[1] || "Unknown",
            arrivalTime:
              (arrivalInfo.time || "Unknown").split(" ")[1] || "Unknown",
            duration: formattedDuration,
            departureAirport: departureInfo.id || params.origin,
            departureCity: departureInfo.name || params.origin,
            arrivalAirport: arrivalInfo.id || params.destination,
            arrivalCity: arrivalInfo.name || params.destination,
            price: flight.price || 0,
            baggageAllowance: flight.baggage_info || "15 kg",
            amenities: flight.extensions || ["Standard Service"],
            logo: logo,
          };
        })
    );
  } catch (error) {
    console.error("Error transforming flight data:", error);
    return getSampleFlightData(params);
  }
}

// Enhanced sample data with destination-specific details
function getSampleFlightData(params: FlightSearchParams): FlightResult[] {
  const { origin, destination, departureDate, returnDate } = params;

  // Create a set of common airlines
  const airlines = [
    {
      name: "Air India",
      code: "AI",
      logo: "https://logos.skyscnr.com/images/airlines/favicon/AI.png",
    },
    {
      name: "IndiGo",
      code: "6E",
      logo: "https://logos.skyscnr.com/images/airlines/favicon/6E.png",
    },
    {
      name: "Vistara",
      code: "UK",
      logo: "https://logos.skyscnr.com/images/airlines/favicon/UK.png",
    },
    {
      name: "SpiceJet",
      code: "SG",
      logo: "https://logos.skyscnr.com/images/airlines/favicon/SG.png",
    },
    {
      name: "GoAir",
      code: "G8",
      logo: "https://logos.skyscnr.com/images/airlines/favicon/G8.png",
    },
    {
      name: "AirAsia India",
      code: "I5",
      logo: "https://logos.skyscnr.com/images/airlines/favicon/I5.png",
    },
  ];

  // Generate prices based on distance between cities
  let basePrice = 3500;
  let flightDuration = "2h 15m";

  // Calculate distance-based price adjustments
  const cityPairs: Record<string, { price: number; duration: string }> = {
    "DEL-BOM": { price: 5200, duration: "2h 10m" },
    "BOM-DEL": { price: 5100, duration: "2h 05m" },
    "DEL-MAA": { price: 6500, duration: "2h 45m" },
    "MAA-DEL": { price: 6400, duration: "2h 40m" },
    "DEL-BLR": { price: 6000, duration: "2h 35m" },
    "BLR-DEL": { price: 5900, duration: "2h 30m" },
    "BOM-BLR": { price: 3800, duration: "1h 35m" },
    "BLR-BOM": { price: 3700, duration: "1h 30m" },
    "DEL-CCU": { price: 5500, duration: "2h 20m" },
    "CCU-DEL": { price: 5400, duration: "2h 15m" },
    "DEL-HYD": { price: 5800, duration: "2h 05m" },
    "HYD-DEL": { price: 5700, duration: "2h 00m" },
    "DEL-ATQ": { price: 3500, duration: "1h 10m" },
    "ATQ-DEL": { price: 3400, duration: "1h 05m" },
  };

  // Get origin and destination codes
  const originCode = getAirportCode(origin);
  const destinationCode = getAirportCode(destination);
  const routeKey = `${originCode}-${destinationCode}`;

  if (cityPairs[routeKey]) {
    basePrice = cityPairs[routeKey].price;
    flightDuration = cityPairs[routeKey].duration;
  }

  // Generate flight times based on the day
  const departureDate2 = new Date(departureDate);
  const morningDeparture = `0${6 + Math.floor(Math.random() * 4)}:${Math.floor(
    Math.random() * 6
  )}${Math.floor(Math.random() * 10)} AM`;
  const afternoonDeparture = `${1 + Math.floor(Math.random() * 4)}:${Math.floor(
    Math.random() * 6
  )}${Math.floor(Math.random() * 10)} PM`;
  const eveningDeparture = `0${5 + Math.floor(Math.random() * 4)}:${Math.floor(
    Math.random() * 6
  )}${Math.floor(Math.random() * 10)} PM`;

  // Generate a set of 8 sample flights for this route
  return Array(8)
    .fill(0)
    .map((_, index) => {
      const airline = airlines[index % airlines.length];
      const isDirectFlight = index < 5; // 5 out of 8 are direct flights

      // Calculate price variations (weekend flights cost more)
      let flightPrice = basePrice;
      if (departureDate2.getDay() === 0 || departureDate2.getDay() === 6) {
        flightPrice += 800; // Weekend premium
      }

      // Add random variation to prices
      flightPrice += Math.floor(Math.random() * 1000) - 500;

      // Generate departure times spaced throughout the day
      const departureTimes = [
        morningDeparture,
        afternoonDeparture,
        eveningDeparture,
      ];
      const departureTime = departureTimes[index % 3];

      // Calculate arrival time based on duration
      const durationParts = flightDuration.match(/(\d+)h\s+(\d+)m/);
      let hoursToAdd = 2;
      let minutesToAdd = 15;
      if (durationParts && durationParts.length >= 3) {
        hoursToAdd = parseInt(durationParts[1]);
        minutesToAdd = parseInt(durationParts[2]);
      }

      // Simple arrival time calculation (not perfect but good enough for samples)
      const depTimeBase = departureTime.includes("AM")
        ? parseInt(departureTime.split(":")[0])
        : parseInt(departureTime.split(":")[0]) + 12;

      const arrivalHour = (depTimeBase + hoursToAdd) % 24;
      const arrivalTime = `${
        arrivalHour > 12 ? arrivalHour - 12 : arrivalHour
      }:${Math.floor(Math.random() * 6)}${Math.floor(Math.random() * 10)} ${
        arrivalHour >= 12 ? "PM" : "AM"
      }`;

      // Generate flight number
      const flightNumber = `${airline.code} ${
        800 + index + Math.floor(Math.random() * 100)
      }`;

      return {
        id: `flight-${index + 1}`,
        airline: airline.name,
        flightNumber: flightNumber,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        duration: isDirectFlight
          ? flightDuration
          : `${parseInt(flightDuration.split("h")[0]) + 1}h ${
              parseInt(flightDuration.split(" ")[1].replace("m", "")) + 15
            }m`,
        departureAirport: originCode,
        departureCity: getFullCityName(origin),
        arrivalAirport: destinationCode,
        arrivalCity: getFullCityName(destination),
        price: flightPrice,
        direct: isDirectFlight,
        layoverAirport: isDirectFlight
          ? undefined
          : getLayoverAirport(originCode, destinationCode),
        layoverCity: isDirectFlight
          ? undefined
          : getLayoverCity(originCode, destinationCode),
        layoverDuration: isDirectFlight
          ? undefined
          : `${Math.floor(Math.random() * 2) + 1}h ${Math.floor(
              Math.random() * 60
            )}m`,
        baggageAllowance: `${index % 2 === 0 ? "25" : "15"} kg`,
        amenities: generateAmenities(airline.name, isDirectFlight),
        logo: airline.logo,
      };
    })
    .sort((a, b) => a.price - b.price); // Sort by price
}

// Helper function to get airport code from city name
function getAirportCode(cityName: string): string {
  const airportCodes: Record<string, string> = {
    Amritsar: "ATQ",
    Delhi: "DEL",
    Mumbai: "BOM",
    Chennai: "MAA",
    Bangalore: "BLR",
    Kolkata: "CCU",
    Hyderabad: "HYD",
    Ahmedabad: "AMD",
    Goa: "GOI",
    "New Delhi": "DEL",
    Thiruvananthapuram: "TRV",
    Jaipur: "JAI",
    Lucknow: "LKO",
  };

  return airportCodes[cityName] || cityName.substring(0, 3).toUpperCase();
}

// Helper function to get full city name from code or partial name
function getFullCityName(cityNameOrCode: string): string {
  const cityNames: Record<string, string> = {
    ATQ: "Amritsar",
    DEL: "New Delhi",
    BOM: "Mumbai",
    MAA: "Chennai",
    BLR: "Bangalore",
    CCU: "Kolkata",
    HYD: "Hyderabad",
    AMD: "Ahmedabad",
    GOI: "Goa",
    TRV: "Thiruvananthapuram",
    JAI: "Jaipur",
    LKO: "Lucknow",
  };

  return cityNames[cityNameOrCode] || cityNameOrCode;
}

// Helper function to determine a realistic layover airport based on route
function getLayoverAirport(origin: string, destination: string): string {
  const commonLayovers: Record<string, string[]> = {
    "DEL-BOM": ["JAI", "AMD"],
    "BOM-DEL": ["JAI", "AMD"],
    "DEL-MAA": ["HYD", "BLR"],
    "MAA-DEL": ["HYD", "BLR"],
    "DEL-BLR": ["HYD"],
    "BLR-DEL": ["HYD"],
    "DEL-HYD": ["BLR"],
    "HYD-DEL": ["BLR"],
    "DEL-CCU": ["LKO", "BBI"],
    "CCU-DEL": ["LKO", "BBI"],
  };

  const route = `${origin}-${destination}`;
  if (commonLayovers[route]) {
    return commonLayovers[route][
      Math.floor(Math.random() * commonLayovers[route].length)
    ];
  }

  // Default layovers if route not found
  const defaultLayovers = ["DEL", "BOM", "BLR", "HYD"];
  return (
    defaultLayovers.filter(
      (airport) => airport !== origin && airport !== destination
    )[0] || "DEL"
  );
}

// Helper function to get layover city name
function getLayoverCity(origin: string, destination: string): string {
  const layoverAirport = getLayoverAirport(origin, destination);
  return getFullCityName(layoverAirport);
}

// Helper function to generate realistic amenities based on airline
function generateAmenities(airlineName: string, isDirect: boolean): string[] {
  const baseAmenities = ["Standard Service", "Wi-Fi"];

  if (airlineName.includes("Air India") || airlineName.includes("Vistara")) {
    return [...baseAmenities, "Meal", "Entertainment"];
  } else if (
    airlineName.includes("IndiGo") ||
    airlineName.includes("SpiceJet")
  ) {
    return [...baseAmenities, "Paid Meal"];
  } else if (airlineName.includes("GoAir")) {
    return [...baseAmenities, "Snack"];
  }

  return baseAmenities;
}
