import { Search, RefreshCw } from 'lucide-react';
import { StatusDot } from './StatusDot';
import { useState, useEffect } from 'react';

interface TopBarProps {
  title: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
}

export function TopBar({ title, searchPlaceholder = 'Search...', onSearch, onRefresh }: TopBarProps) {
  const [autoRefresh, setAutoRefresh] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh === null) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, autoRefresh * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  return (
    <header className="h-14 flex-shrink-0 bg-card border-b border-border flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-64 h-9 pl-9 pr-4 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Auto-refresh toggle */}
        <select
          value={autoRefresh ?? ''}
          onChange={(e) => setAutoRefresh(e.target.value ? Number(e.target.value) : null)}
          className="h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Auto: Off</option>
          <option value="3">Auto: 3s</option>
          <option value="5">Auto: 5s</option>
        </select>

        {/* Status indicator */}
        <StatusDot status="healthy" showLabel />
      </div>
    </header>
  );
}