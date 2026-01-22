import { useMemo, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { SummaryCard } from '@/components/SummaryCard';
import { ProcessesTable } from '@/components/ProcessesTable';
import { RemotePortsList } from '@/components/RemotePortsList';
import { RecentChangesList } from '@/components/RecentChangesList';
import { 
  mockConnections, 
  mockRecentChanges, 
  getProcessStats, 
  getRemotePortStats 
} from '@/data/mockData';
import { Network, Globe, Wifi, Radio } from 'lucide-react';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const activeConnections = mockConnections.length;
    const uniqueRemoteIPs = new Set(mockConnections.map(c => c.remoteAddr)).size;
    const establishedTCP = mockConnections.filter(c => c.protocol === 'TCP' && c.state === 'ESTABLISHED').length;
    const listeningPorts = mockConnections.filter(c => c.state === 'LISTENING').length;
    
    return { activeConnections, uniqueRemoteIPs, establishedTCP, listeningPorts };
  }, []);

  const processStats = useMemo(() => getProcessStats(mockConnections), []);
  const portStats = useMemo(() => getRemotePortStats(mockConnections), []);

  return (
    <>
      <TopBar 
        title="Dashboard" 
        searchPlaceholder="Search connections..."
        onSearch={setSearchQuery}
      />
      
      <main className="flex-1 overflow-auto p-6 min-h-0">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Active Connections"
            value={stats.activeConnections}
            icon={Network}
            trend={{ value: 3, isUp: true }}
          />
          <SummaryCard
            title="Unique Remote IPs"
            value={stats.uniqueRemoteIPs}
            icon={Globe}
          />
          <SummaryCard
            title="Established TCP"
            value={stats.establishedTCP}
            icon={Wifi}
          />
          <SummaryCard
            title="Listening Ports"
            value={stats.listeningPorts}
            icon={Radio}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Left - Processes Table */}
          <div className="col-span-2">
            <ProcessesTable processes={processStats} />
          </div>

          {/* Right - Remote Ports */}
          <div>
            <RemotePortsList ports={portStats} />
          </div>
        </div>

        {/* Recent Changes */}
        <RecentChangesList changes={mockRecentChanges} />
      </main>
    </>
  );
}
