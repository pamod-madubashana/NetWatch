import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronDown } from 'lucide-react';
import { Connection } from '@/types/netwatch';

interface FiltersBarProps {
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export interface FilterState {
  search: string;
  protocol: 'all' | 'TCP' | 'UDP';
  state: 'all' | 'ESTABLISHED' | 'LISTENING' | 'TIME_WAIT' | 'CLOSE_WAIT' | 'SYN_SENT';
  hideLocalhost: boolean;
  onlyEstablished: boolean;
  risk: 'all' | 'low' | 'medium' | 'high';
}

export function FiltersBar({ onFiltersChange, totalCount, filteredCount }: FiltersBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    protocol: 'all',
    state: 'all',
    hideLocalhost: false,
    onlyEstablished: false,
    risk: 'all',
  });

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search IP, port, or process..."
            className="w-full h-9 pl-9 pr-4 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Protocol */}
        <select
          value={filters.protocol}
          onChange={(e) => updateFilter('protocol', e.target.value as FilterState['protocol'])}
          className="h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Protocols</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
        </select>

        {/* State */}
        <select
          value={filters.state}
          onChange={(e) => updateFilter('state', e.target.value as FilterState['state'])}
          className="h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All States</option>
          <option value="ESTABLISHED">Established</option>
          <option value="LISTENING">Listening</option>
          <option value="TIME_WAIT">Time Wait</option>
          <option value="CLOSE_WAIT">Close Wait</option>
          <option value="SYN_SENT">Syn Sent</option>
        </select>

        {/* Risk */}
        <select
          value={filters.risk}
          onChange={(e) => updateFilter('risk', e.target.value as FilterState['risk'])}
          className="h-9 px-3 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Risk</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Toggles */}
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hideLocalhost}
            onChange={(e) => updateFilter('hideLocalhost', e.target.checked)}
            className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-ring"
          />
          Hide localhost
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyEstablished}
            onChange={(e) => updateFilter('onlyEstablished', e.target.checked)}
            className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-ring"
          />
          Only established
        </label>

        {/* Export */}
        <div className="relative">
          <button className="h-9 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          {/* Export dropdown would go here - implemented in Connections page */}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mt-3">
        Showing {filteredCount} of {totalCount} connections
      </p>
    </div>
  );
}

export function applyFilters(connections: Connection[], filters: FilterState): Connection[] {
  return connections.filter((conn) => {
    // Search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const searchable = `${conn.processName} ${conn.pid} ${conn.localAddr}:${conn.localPort} ${conn.remoteAddr}:${conn.remotePort}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    // Protocol
    if (filters.protocol !== 'all' && conn.protocol !== filters.protocol) return false;

    // State
    if (filters.state !== 'all' && conn.state !== filters.state) return false;

    // Risk
    if (filters.risk !== 'all' && conn.risk !== filters.risk) return false;

    // Hide localhost
    if (filters.hideLocalhost) {
      if (conn.localAddr === '127.0.0.1' || conn.remoteAddr === '127.0.0.1' || conn.remoteAddr === '0.0.0.0') {
        return false;
      }
    }

    // Only established
    if (filters.onlyEstablished && conn.state !== 'ESTABLISHED') return false;

    return true;
  });
}
