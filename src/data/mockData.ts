export interface Connection {
  id: string;
  processName: string;
  pid: number;
  protocol: 'TCP' | 'UDP';
  localAddr: string;
  localPort: number;
  remoteAddr: string;
  remotePort: number;
  state: 'ESTABLISHED' | 'LISTENING' | 'TIME_WAIT' | 'CLOSE_WAIT' | 'SYN_SENT';
  risk: 'low' | 'medium' | 'high';
  riskReasons: string[];
  capturedAt: Date;
}

export interface RecentChange {
  id: string;
  type: 'new' | 'closed' | 'changed';
  message: string;
  timestamp: Date;
  processName: string;
}

export const mockConnections: Connection[] = [
  {
    id: '1',
    processName: 'chrome.exe',
    pid: 12456,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 54321,
    remoteAddr: '172.217.14.99',
    remotePort: 443,
    state: 'ESTABLISHED',
    risk: 'low',
    riskReasons: ['Known Google IP', 'HTTPS connection'],
    capturedAt: new Date(Date.now() - 3000),
  },
  {
    id: '2',
    processName: 'chrome.exe',
    pid: 12456,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 54322,
    remoteAddr: '151.101.1.69',
    remotePort: 443,
    state: 'ESTABLISHED',
    risk: 'low',
    riskReasons: ['Known Reddit CDN'],
    capturedAt: new Date(Date.now() - 5000),
  },
  {
    id: '3',
    processName: 'discord.exe',
    pid: 8842,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 54400,
    remoteAddr: '162.159.128.233',
    remotePort: 443,
    state: 'ESTABLISHED',
    risk: 'low',
    riskReasons: ['Discord CDN'],
    capturedAt: new Date(Date.now() - 8000),
  },
  {
    id: '4',
    processName: 'discord.exe',
    pid: 8842,
    protocol: 'UDP',
    localAddr: '192.168.1.105',
    localPort: 50001,
    remoteAddr: '66.22.197.170',
    remotePort: 50010,
    state: 'ESTABLISHED',
    risk: 'medium',
    riskReasons: ['Voice server connection', 'Non-standard port'],
    capturedAt: new Date(Date.now() - 2000),
  },
  {
    id: '5',
    processName: 'node.exe',
    pid: 15200,
    protocol: 'TCP',
    localAddr: '127.0.0.1',
    localPort: 3000,
    remoteAddr: '0.0.0.0',
    remotePort: 0,
    state: 'LISTENING',
    risk: 'low',
    riskReasons: ['Local development server'],
    capturedAt: new Date(Date.now() - 120000),
  },
  {
    id: '6',
    processName: 'node.exe',
    pid: 15200,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 54500,
    remoteAddr: '104.16.85.20',
    remotePort: 443,
    state: 'ESTABLISHED',
    risk: 'low',
    riskReasons: ['NPM registry'],
    capturedAt: new Date(Date.now() - 45000),
  },
  {
    id: '7',
    processName: 'steam.exe',
    pid: 9920,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 54600,
    remoteAddr: '155.133.248.36',
    remotePort: 443,
    state: 'ESTABLISHED',
    risk: 'low',
    riskReasons: ['Steam CDN'],
    capturedAt: new Date(Date.now() - 30000),
  },
  {
    id: '8',
    processName: 'steam.exe',
    pid: 9920,
    protocol: 'UDP',
    localAddr: '192.168.1.105',
    localPort: 27015,
    remoteAddr: '155.133.248.40',
    remotePort: 27017,
    state: 'ESTABLISHED',
    risk: 'medium',
    riskReasons: ['Game server port', 'UDP connection'],
    capturedAt: new Date(Date.now() - 15000),
  },
  {
    id: '9',
    processName: 'code.exe',
    pid: 7788,
    protocol: 'TCP',
    localAddr: '127.0.0.1',
    localPort: 5500,
    remoteAddr: '0.0.0.0',
    remotePort: 0,
    state: 'LISTENING',
    risk: 'low',
    riskReasons: ['VS Code extension server'],
    capturedAt: new Date(Date.now() - 180000),
  },
  {
    id: '10',
    processName: 'code.exe',
    pid: 7788,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 54700,
    remoteAddr: '20.190.151.68',
    remotePort: 443,
    state: 'ESTABLISHED',
    risk: 'low',
    riskReasons: ['Microsoft telemetry'],
    capturedAt: new Date(Date.now() - 60000),
  },
  {
    id: '11',
    processName: 'unknown.exe',
    pid: 4412,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 54800,
    remoteAddr: '185.220.101.33',
    remotePort: 8080,
    state: 'ESTABLISHED',
    risk: 'high',
    riskReasons: ['Unknown process', 'Connection to Tor exit node', 'Non-standard port'],
    capturedAt: new Date(Date.now() - 1000),
  },
  {
    id: '12',
    processName: 'svchost.exe',
    pid: 1200,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 54900,
    remoteAddr: '13.107.4.50',
    remotePort: 443,
    state: 'TIME_WAIT',
    risk: 'low',
    riskReasons: ['Windows Update'],
    capturedAt: new Date(Date.now() - 90000),
  },
  {
    id: '13',
    processName: 'Dropbox.exe',
    pid: 5566,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 55000,
    remoteAddr: '162.125.64.1',
    remotePort: 443,
    state: 'ESTABLISHED',
    risk: 'low',
    riskReasons: ['Dropbox sync'],
    capturedAt: new Date(Date.now() - 25000),
  },
  {
    id: '14',
    processName: 'suspicious.exe',
    pid: 6677,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 55100,
    remoteAddr: '91.134.125.21',
    remotePort: 4444,
    state: 'ESTABLISHED',
    risk: 'high',
    riskReasons: ['Unknown process', 'Known malware port', 'Suspicious IP geolocation'],
    capturedAt: new Date(Date.now() - 500),
  },
  {
    id: '15',
    processName: 'chrome.exe',
    pid: 12456,
    protocol: 'TCP',
    localAddr: '192.168.1.105',
    localPort: 55200,
    remoteAddr: '142.250.185.206',
    remotePort: 443,
    state: 'ESTABLISHED',
    risk: 'low',
    riskReasons: ['Google services'],
    capturedAt: new Date(Date.now() - 7000),
  },
];

export const mockRecentChanges: RecentChange[] = [
  {
    id: '1',
    type: 'new',
    message: 'New connection: suspicious.exe → 91.134.125.21:4444',
    timestamp: new Date(Date.now() - 500),
    processName: 'suspicious.exe',
  },
  {
    id: '2',
    type: 'new',
    message: 'New connection: unknown.exe → 185.220.101.33:8080',
    timestamp: new Date(Date.now() - 1000),
    processName: 'unknown.exe',
  },
  {
    id: '3',
    type: 'new',
    message: 'New connection: discord.exe → 66.22.197.170:50010 (UDP)',
    timestamp: new Date(Date.now() - 2000),
    processName: 'discord.exe',
  },
  {
    id: '4',
    type: 'closed',
    message: 'Connection closed: chrome.exe → 172.217.14.100:443',
    timestamp: new Date(Date.now() - 10000),
    processName: 'chrome.exe',
  },
  {
    id: '5',
    type: 'changed',
    message: 'State change: steam.exe TIME_WAIT → ESTABLISHED',
    timestamp: new Date(Date.now() - 15000),
    processName: 'steam.exe',
  },
  {
    id: '6',
    type: 'new',
    message: 'New listener: node.exe on port 3000',
    timestamp: new Date(Date.now() - 120000),
    processName: 'node.exe',
  },
];

export const getProcessStats = (connections: Connection[]) => {
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
};

export const getRemotePortStats = (connections: Connection[]) => {
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
};
