'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });

      const data = (await response.json()) as { success: boolean; message?: string; error?: string };

      if (data.success) {
        toast.success('Data synced successfully', {
          description: 'Your health data has been refreshed from the /data folder.',
        });
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error('Sync failed', {
          description: data.error ?? 'Unknown error occurred',
        });
      }
    } catch (error) {
      toast.error('Sync failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="default"
    >
      {isLoading ? 'Syncing...' : 'Sync Data'}
    </Button>
  );
}
