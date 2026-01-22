import { useState, useEffect, useMemo } from 'react';
import { TopBar } from '@/components/TopBar';
import { FiltersBar, FilterState, applyFilters } from '@/components/FiltersBar';
import { ConnectionsTable } from '@/components/ConnectionsTable';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { getConnections, exportConnections } from '@/api/tauri';
import { Connection } from '@/types/netwatch';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RotateCcw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

const ITEMS_PER_PAGE = 10;

export default function Connections() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    protocol: 'all',
    state: 'all',
    hideLocalhost: false,
    onlyEstablished: false,
    risk: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedConnections = await getConnections();
      setConnections(fetchedConnections);
    } catch (err) {
      logger.error('Failed to fetch connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      if (connections.length === 0) {
        toast({
          title: 'Nothing to export',
          description: 'No connections available to export.',
          variant: 'destructive',
        });
        return;
      }
      
      const filePath = await exportConnections(format, connections);
      toast({
        title: 'Export successful',
        description: `File saved to: ${filePath}`,
      });
    } catch (err) {
      logger.error('Export failed:', err);
      toast({
        title: 'Export failed',
        description: err instanceof Error ? err.message : 'An error occurred during export',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchConnections();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchConnections, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  const filteredConnections = useMemo(() => {
    let result = applyFilters(connections, filters);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(conn => {
        const searchable = `${conn.processName} ${conn.pid} ${conn.localAddr}:${conn.localPort} ${conn.remoteAddr}:${conn.remotePort}`.toLowerCase();
        return searchable.includes(query);
      });
    }
    
    return result;
  }, [connections, filters, searchQuery]);

  const paginatedConnections = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredConnections.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredConnections, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredConnections.length / ITEMS_PER_PAGE));

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <>
      <TopBar 
        title="Connections" 
        searchPlaceholder="Quick search..."
        onSearch={setSearchQuery}
      />
              
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchConnections}
          disabled={loading}
        >
          <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
                
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={autoRefresh ? 'bg-accent' : ''}
        >
          Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
        </Button>
                
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <main className="flex-1 overflow-auto p-6 min-h-0">

        <FiltersBar
          onFiltersChange={handleFiltersChange}
          totalCount={connections.length}
          filteredCount={filteredConnections.length}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <ErrorBanner message={`Failed to load connections: ${error}`} />
        ) : filteredConnections.length === 0 ? (
          <EmptyState 
            title="No connections found"
            description="Try adjusting your filters or search terms to find what you're looking for."
          />
        ) : (
          <>
            <ConnectionsTable connections={paginatedConnections} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}
