
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bug, RefreshCcw, ExternalLink, Server, Terminal } from 'lucide-react';

interface ApiStatusProps {
  isUsingSampleData: boolean;
  apiName: string;
  lastError?: string;
  onRetry?: () => void;
}

const ApiDebugStatus: React.FC<ApiStatusProps> = ({ 
  isUsingSampleData, 
  apiName, 
  lastError, 
  onRetry 
}) => {
  if (!isUsingSampleData) {
    return null;
  }

  const handleStartServer = () => {
    window.open('http://localhost:3001/api/health', '_blank');
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Bug className="h-4 w-4" /> API Error: {apiName} Data
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>
          Showing sample {apiName.toLowerCase()} data due to API connection issues.
          {lastError && <span className="block mt-1 text-xs opacity-75 bg-rose-50 p-1 rounded">Error details: {lastError}</span>}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-gray-100"
            >
              <RefreshCcw className="h-3 w-3 mr-1" /> Retry API Connection
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white hover:bg-gray-100"
            onClick={handleStartServer}
          >
            <Terminal className="h-3 w-3 mr-1" /> Check Backend Server
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white hover:bg-gray-100"
            onClick={() => window.open('https://serpapi.com/google-flights-api', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> API Documentation
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white hover:bg-gray-100"
            onClick={() => window.open('https://docs.lovable.dev/integrations/supabase/', '_blank')}
          >
            <Server className="h-3 w-3 mr-1" /> Backend Setup Guide
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiDebugStatus;
