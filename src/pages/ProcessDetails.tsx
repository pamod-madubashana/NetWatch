import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { SummaryCard } from '@/components/SummaryCard';
import { RiskBadge } from '@/components/RiskBadge';
import { ConnectionsTable } from '@/components/ConnectionsTable';
import { getConnections } from '@/api/tauri';
import { Connection } from '@/types/netwatch';
import { ArrowLeft, Copy, Download, Network, Globe, AlertTriangle } from 'lucide-react';

export default function ProcessDetails() {
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const pidNumber = parseInt(pid || '0', 10);
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

  const processConnections = useMemo(() => {
    return connections
      .filter(conn => conn.pid === pidNumber);
  }, [connections, pidNumber]);

  const processName = processConnections[0]?.processName || 'Unknown Process';

  const stats = useMemo(() => {
    const totalConnections = processConnections.length;
    const uniqueRemoteIPs = new Set(processConnections.map(c => c.remoteAddr)).size;
    
    let highestRisk: 'low' | 'medium' | 'high' = 'low';
    processConnections.forEach((conn: Connection) => {
      if (conn.risk === 'high') highestRisk = 'high';
      else if (conn.risk === 'medium' && highestRisk !== 'high') highestRisk = 'medium';
    });
    
    return { totalConnections, uniqueRemoteIPs, highestRisk };
  }, [processConnections]);

  const remoteIPBreakdown = useMemo(() => {
    const ipMap = new Map<string, number>();
    processConnections.forEach((conn: Connection) => {
      const count = ipMap.get(conn.remoteAddr) || 0;
      ipMap.set(conn.remoteAddr, count + 1);
    });
    return Array.from(ipMap.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count);
  }, [processConnections]);

  const allRiskReasons = useMemo(() => {
    const reasons = new Set<string>();
    processConnections.forEach((conn: Connection) => {
      conn.riskReasons.forEach((r: string) => reasons.add(r));
    });
    return Array.from(reasons);
  }, [processConnections]);

  if (loading) {
    return (
      <>
        <TopBar title="Process Details" />
        <main className="flex-1 overflow-auto p-6 min-h-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </>
    );
  }

  if (processConnections.length === 0) {
    return (
      <>
        <TopBar title="Process Details" />
        <main className="flex-1 overflow-auto p-6 min-h-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Process not found or no connections available.</p>
          </div>
        </main>
      </>
    );
  }

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
      <TopBar title="Process Details" onRefresh={fetchConnections} />
      
      <main className="flex-1 overflow-auto p-6 min-h-0">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Connections
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-foreground">{processName}</h2>
            <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-mono">
              PID: {pidNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Copy className="w-4 h-4" />
              Copy Report
            </button>
            <button className="h-9 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <SummaryCard
            title="Total Connections"
            value={stats.totalConnections}
            icon={Network}
          />
          <SummaryCard
            title="Unique Remote IPs"
            value={stats.uniqueRemoteIPs}
            icon={Globe}
          />
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Highest Risk</p>
                <div className="mt-2">
                  <RiskBadge risk={stats.highestRisk} />
                </div>
              </div>
              <div className="p-2 bg-secondary rounded-lg">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left - Connections Table */}
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-foreground mb-3">Connections</h3>
            <ConnectionsTable connections={processConnections} />
          </div>

          {/* Right - IP Breakdown & Risk Reasons */}
          <div className="space-y-6">
            {/* Remote IP Breakdown */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">Remote IP Breakdown</h3>
              </div>
              <div className="divide-y divide-border max-h-64 overflow-auto">
                {remoteIPBreakdown.map(({ ip, count }) => (
                  <div key={ip} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-mono text-foreground">{ip}</span>
                    <span className="text-sm text-muted-foreground">{count}×</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Reasons */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">Risk Analysis</h3>
              </div>
              <div className="p-4">
                {allRiskReasons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No risk factors identified.</p>
                ) : (
                  <ul className="space-y-2">
                    {allRiskReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                        <span className="text-foreground">{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
