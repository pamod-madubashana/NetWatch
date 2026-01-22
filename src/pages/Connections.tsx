import { useState, useEffect, useMemo } from 'react';
import { TopBar } from '@/components/TopBar';
import { FiltersBar, FilterState, applyFilters } from '@/components/FiltersBar';
import { ConnectionsTable } from '@/components/ConnectionsTable';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { getConnections } from '@/api/tauri';
import { Connection } from '@/types/netwatch';
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



  useEffect(() => {
    fetchConnections();
  }, []);

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
        onRefresh={fetchConnections}
      />
              
      <div className="mb-4"></div>
      
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
