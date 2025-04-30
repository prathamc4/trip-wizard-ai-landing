
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bug, RefreshCcw } from 'lucide-react';

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
        <Bug className="h-4 w-4" /> API Connection Issue: {apiName}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>
          Currently using sample data because we couldn't connect to the {apiName} API.
          {lastError && <span className="block mt-1 text-xs opacity-75">Error: {lastError}</span>}
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            <RefreshCcw className="h-3 w-3 mr-1" /> Retry API
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ApiDebugStatus;
