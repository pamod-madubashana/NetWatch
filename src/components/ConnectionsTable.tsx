import { useNavigate } from 'react-router-dom';
import { Connection } from '@/types/netwatch';
import { RiskBadge } from './RiskBadge';
import { formatDistanceToNow } from 'date-fns';

interface ConnectionsTableProps {
  connections: Connection[];
}

export function ConnectionsTable({ connections }: ConnectionsTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (pid: number) => {
    navigate(`/process/${pid}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Risk</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Process</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Protocol</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Local</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Remote</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">State</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Captured</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {connections.map((conn) => (
            <tr
              key={conn.id}
              onClick={() => handleRowClick(conn.pid)}
              className="hover:bg-card-hover cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <RiskBadge risk={conn.risk} size="sm" />
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{conn.processName}</p>
                  <p className="text-xs text-muted-foreground">PID: {conn.pid}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-foreground">{conn.protocol}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-foreground font-mono">
                  {conn.localAddr}:{conn.localPort}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-foreground font-mono">
                  {conn.remoteAddr}:{conn.remotePort}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                  {conn.state}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(conn.capturedAt), { addSuffix: true })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
