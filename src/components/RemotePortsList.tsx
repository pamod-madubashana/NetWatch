import { RiskBadge } from './RiskBadge';

interface PortStat {
  port: number;
  protocol: string;
  count: number;
  maxRisk: 'low' | 'medium' | 'high';
}

interface RemotePortsListProps {
  ports: PortStat[];
  maxRows?: number;
}

export function RemotePortsList({ ports, maxRows = 10 }: RemotePortsListProps) {
  const displayedPorts = ports.slice(0, maxRows);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Top Remote Ports</h3>
      </div>
      <div className="divide-y divide-border">
        {displayedPorts.map((port) => (
          <div key={port.port} className="flex items-center justify-between px-4 py-2.5 hover:bg-card-hover transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-foreground">{port.port}</span>
              <span className="text-xs text-muted-foreground">{port.protocol}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{port.count}×</span>
              <RiskBadge risk={port.maxRisk} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
