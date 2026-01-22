export interface Connection {
  id: string;
  processName: string;
  pid: number;
  protocol: 'TCP' | 'UDP';
  localAddr: string;
  localPort: number;
  remoteAddr: string;
  remotePort: number;
  state: string;
  risk: 'low' | 'medium' | 'high';
  riskReasons: string[];
  capturedAt: number; // Unix timestamp in milliseconds
}

export interface ExportFormat {
  format: 'json' | 'csv';
  filePath?: string;
  error?: string;
}