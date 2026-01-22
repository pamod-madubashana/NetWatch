import { formatDistanceToNow } from 'date-fns';
import { Connection } from '@/types/netwatch';
import { Plus, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentChange {
  id: string;
  type: 'new' | 'closed' | 'changed';
  message: string;
  timestamp: number; // Unix timestamp in milliseconds
  processName: string;
}

interface RecentChangesListProps {
  changes: RecentChange[];
  maxItems?: number;
}

export function RecentChangesList({ changes, maxItems = 6 }: RecentChangesListProps) {
  const displayedChanges = changes.slice(0, maxItems);

  const getIcon = (type: RecentChange['type']) => {
    switch (type) {
      case 'new':
        return <Plus className="w-3.5 h-3.5 text-risk-low" />;
      case 'closed':
        return <X className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'changed':
        return <RefreshCw className="w-3.5 h-3.5 text-risk-medium" />;
    }
  };

  const getBorderColor = (type: RecentChange['type']) => {
    switch (type) {
      case 'new':
        return 'border-l-risk-low';
      case 'closed':
        return 'border-l-muted-foreground';
      case 'changed':
        return 'border-l-risk-medium';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Recent Changes</h3>
      </div>
      <div className="divide-y divide-border">
        {displayedChanges.map((change) => (
          <div 
            key={change.id} 
            className={cn(
              'flex items-start gap-3 px-4 py-3 border-l-2',
              getBorderColor(change.type)
            )}
          >
            <div className="mt-0.5">{getIcon(change.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{change.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(change.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
