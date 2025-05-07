
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // In production, restrict this to your frontend domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request body
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Flight search API endpoint
app.get('/api/flights', async (req, res) => {
  try {
    const { origin, destination, date, return: returnDate, currency, key } = req.query;
    
    if (!key) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Log the request for debugging
    console.log('Flight search request received:', { origin, destination, date, returnDate, currency });

    // Format the URL for SerpAPI Google Flights
    const apiUrl = `https://serpapi.com/search.json?engine=google_flights&departure_id=${origin}&arrival_id=${destination}&outbound_date=${date}&return_date=${returnDate}&currency=${currency}&api_key=${key}`;
    
    console.log('Requesting data from SerpAPI...');
    
    // Make the request to SerpAPI
    const response = await axios.get(apiUrl);
    
    // Return the flight data
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching flight data from API:', error.message);
    
    // Send appropriate error response
    if (error.response) {
      // API responded with an error status
      res.status(error.response.status).json({
        error: 'External API error',
        message: error.response.data.error || 'Failed to fetch flight data'
      });
    } else if (error.request) {
      // Request was made but no response received
      res.status(502).json({ 
        error: 'Gateway error', 
        message: 'No response from external API' 
      });
    } else {
      // Error in setting up request
      res.status(500).json({ 
        error: 'Server error', 
        message: error.message 
      });
    }
  }
});

// Hotel search API endpoint
app.get('/api/hotels', async (req, res) => {
  try {
    const { destination, checkInDate, checkOutDate, adults, currency, key } = req.query;
    
    if (!key) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Log the request for debugging
    console.log('Hotel search request received:', { destination, checkInDate, checkOutDate, adults, currency });

    // Format the URL for SerpAPI Google Hotels
    const apiUrl = `https://serpapi.com/search.json?engine=google_hotels&q=hotels+in+${encodeURIComponent(destination)}&check_in_date=${checkInDate}&check_out_date=${checkOutDate}&adults=${adults || 2}&currency=${currency || 'INR'}&api_key=${key}`;
    
    console.log('Requesting hotel data from SerpAPI...');
    
    // Make the request to SerpAPI
    const response = await axios.get(apiUrl);
    
    // Return the hotel data
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching hotel data from API:', error.message);
    
    // Send appropriate error response
    if (error.response) {
      // API responded with an error status
      res.status(error.response.status).json({
        error: 'External API error',
        message: error.response.data.error || 'Failed to fetch hotel data'
      });
    } else if (error.request) {
      // Request was made but no response received
      res.status(502).json({ 
        error: 'Gateway error', 
        message: 'No response from external API' 
      });
    } else {
      // Error in setting up request
      res.status(500).json({ 
        error: 'Server error', 
        message: error.message 
      });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
