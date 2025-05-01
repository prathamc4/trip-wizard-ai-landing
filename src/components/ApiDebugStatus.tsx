
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bug, RefreshCcw, ExternalLink } from 'lucide-react';

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

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Bug className="h-4 w-4" /> Demo Mode: {apiName} API
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>
          Currently showing sample {apiName.toLowerCase()} data because we couldn't connect to the real API.
          {lastError && <span className="block mt-1 text-xs opacity-75">Error: {lastError}</span>}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
            >
              <RefreshCcw className="h-3 w-3 mr-1" /> Retry API
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://docs.lovable.dev/tips-tricks/troubleshooting#api-connection-issues', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> API Troubleshooting
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiDebugStatus;
