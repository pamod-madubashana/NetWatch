import { useState, useMemo } from 'react';
import { TopBar } from '@/components/TopBar';
import { FiltersBar, FilterState, applyFilters } from '@/components/FiltersBar';
import { ConnectionsTable } from '@/components/ConnectionsTable';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { mockConnections } from '@/data/mockData';

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
  const [showError] = useState(false);

  const filteredConnections = useMemo(() => {
    let result = applyFilters(mockConnections, filters);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(conn => {
        const searchable = `${conn.processName} ${conn.pid} ${conn.localAddr}:${conn.localPort} ${conn.remoteAddr}:${conn.remotePort}`.toLowerCase();
        return searchable.includes(query);
      });
    }
    
    return result;
  }, [filters, searchQuery]);

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
      
      <main className="flex-1 overflow-auto p-6 min-h-0">
        {showError && (
          <div className="mb-4">
            <ErrorBanner message="Failed to fetch latest connections. Showing cached data." />
          </div>
        )}

        <FiltersBar
          onFiltersChange={handleFiltersChange}
          totalCount={mockConnections.length}
          filteredCount={filteredConnections.length}
        />

        {filteredConnections.length === 0 ? (
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
