import { useMemo, useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { SummaryCard } from '@/components/SummaryCard';
import { ProcessesTable } from '@/components/ProcessesTable';
import { RemotePortsList } from '@/components/RemotePortsList';
import { RecentChangesList } from '@/components/RecentChangesList';
import { getConnections } from '@/api/tauri';
import { Connection } from '@/types/netwatch';
import { Network, Globe, Wifi, Radio } from 'lucide-react';

export default function Dashboard() {
  const [, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedConnections = await getConnections();
        setConnections(fetchedConnections);
      } catch (error) {
        console.error('Failed to fetch connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const activeConnections = connections.length;
    const uniqueRemoteIPs = new Set(connections.map(c => c.remoteAddr)).size;
    const establishedTCP = connections.filter(c => c.protocol === 'TCP' && c.state === 'ESTABLISHED').length;
    const listeningPorts = connections.filter(c => c.state === 'LISTENING').length;
    
    return { activeConnections, uniqueRemoteIPs, establishedTCP, listeningPorts };
  }, [connections]);

  const processStats = useMemo(() => {
    const processMap = new Map<number, { name: string; count: number; maxRisk: 'low' | 'medium' | 'high' }>();
    
    connections.forEach(conn => {
      const existing = processMap.get(conn.pid);
      if (existing) {
        existing.count++;
        if (conn.risk === 'high' || (conn.risk === 'medium' && existing.maxRisk === 'low')) {
          existing.maxRisk = conn.risk;
        }
      } else {
        processMap.set(conn.pid, { name: conn.processName, count: 1, maxRisk: conn.risk });
      }
    });
    
    return Array.from(processMap.entries())
      .map(([pid, data]) => ({ pid, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [connections]);

  const portStats = useMemo(() => {
    const portMap = new Map<number, { protocol: string; count: number; maxRisk: 'low' | 'medium' | 'high' }>();
    
    connections.forEach(conn => {
      if (conn.remotePort === 0) return;
      const existing = portMap.get(conn.remotePort);
      if (existing) {
        existing.count++;
        if (conn.risk === 'high' || (conn.risk === 'medium' && existing.maxRisk === 'low')) {
          existing.maxRisk = conn.risk;
        }
      } else {
        portMap.set(conn.remotePort, { protocol: conn.protocol, count: 1, maxRisk: conn.risk });
      }
    });
    
    return Array.from(portMap.entries())
      .map(([port, data]) => ({ port, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [connections]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const fetchedConnections = await getConnections();
      setConnections(fetchedConnections);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar 
        title="Dashboard" 
        searchPlaceholder="Search connections..."
        onSearch={setSearchQuery}
        onRefresh={fetchConnections}
      />
      
      {loading && (
        <div className="flex justify-center items-center h-16 bg-card border-b border-border">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        </div>
      )}
      
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
        <RecentChangesList changes={[]} />
      </main>
    </>
  );
}
