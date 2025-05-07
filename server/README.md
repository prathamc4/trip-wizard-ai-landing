
# Travel Planner Backend Server

This is a simple Express.js backend server that handles API requests for the Travel Planner application.

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file with your API keys (see `.env.example` file).

3. Start the server:
```
npm start
```

## Development

For development with auto-reload, use:
```
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/flights` - Flight search endpoint (proxies requests to SerpAPI)

