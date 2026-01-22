import { useNavigate } from 'react-router-dom';
import { RiskBadge } from './RiskBadge';

interface ProcessRow {
  pid: number;
  name: string;
  count: number;
  maxRisk: 'low' | 'medium' | 'high';
}

interface ProcessesTableProps {
  processes: ProcessRow[];
  maxRows?: number;
}

export function ProcessesTable({ processes, maxRows = 8 }: ProcessesTableProps) {
  const navigate = useNavigate();
  const displayedProcesses = processes.slice(0, maxRows);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Top Processes</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Process</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">PID</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Connections</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {displayedProcesses.map((proc) => (
            <tr
              key={proc.pid}
              onClick={() => navigate(`/process/${proc.pid}`)}
              className="hover:bg-card-hover cursor-pointer transition-colors"
            >
              <td className="px-4 py-2.5">
                <span className="text-sm font-medium text-foreground">{proc.name}</span>
              </td>
              <td className="px-4 py-2.5">
                <span className="text-sm text-muted-foreground font-mono">{proc.pid}</span>
              </td>
              <td className="px-4 py-2.5">
                <span className="text-sm text-foreground">{proc.count}</span>
              </td>
              <td className="px-4 py-2.5">
                <RiskBadge risk={proc.maxRisk} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
