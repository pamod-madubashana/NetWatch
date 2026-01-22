import { TopBar } from '@/components/TopBar';
import { Activity, ExternalLink } from 'lucide-react';

const techStack = [
  { name: 'Tauri', color: 'bg-risk-medium-bg text-risk-medium' },
  { name: 'Rust', color: 'bg-risk-high-bg text-risk-high' },
  { name: 'React', color: 'bg-primary/20 text-primary' },
  { name: 'TypeScript', color: 'bg-primary/20 text-primary' },
];

export default function About() {
  return (
    <>
      <TopBar title="About" />
      
      <main className="flex-1 overflow-auto p-6 min-h-0">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8">
            {/* Logo & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <Activity className="w-9 h-9 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">NetWatch</h1>
                <p className="text-sm text-muted-foreground">Network Connection Monitor</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-foreground leading-relaxed mb-6">
              NetWatch is a lightweight desktop application that monitors network connections on your system in real-time. 
              Track active connections, identify processes making network requests, and detect potentially suspicious activity.
            </p>

            {/* Tech Stack */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Built With</h3>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${tech.color}`}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between bg-secondary/50 rounded px-3 py-2">
                  <span className="text-foreground">Dashboard</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-muted-foreground font-mono text-xs">⌘1</kbd>
                </div>
                <div className="flex items-center justify-between bg-secondary/50 rounded px-3 py-2">
                  <span className="text-foreground">Connections</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-muted-foreground font-mono text-xs">⌘2</kbd>
                </div>
                <div className="flex items-center justify-between bg-secondary/50 rounded px-3 py-2">
                  <span className="text-foreground">About</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-muted-foreground font-mono text-xs">⌘3</kbd>
                </div>
                <div className="flex items-center justify-between bg-secondary/50 rounded px-3 py-2">
                  <span className="text-foreground">Go Back</span>
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-muted-foreground font-mono text-xs">Esc</kbd>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Privacy Notice:</strong> NetWatch operates entirely locally on your machine. 
                No connection data is ever sent externally. All monitoring and analysis happens in real-time on your device.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                GitHub Repository
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Documentation
              </a>
            </div>

            {/* Version */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Version 1.0.0 • © 2024 NetWatch
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
