import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorBannerProps {
  message: string;
  dismissible?: boolean;
}

export function ErrorBanner({ message, dismissible = true }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-risk-high-bg border border-risk-high/30 rounded-lg px-4 py-3">
      <AlertTriangle className="w-5 h-5 text-risk-high flex-shrink-0" />
      <p className="text-sm text-foreground flex-1">{message}</p>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-risk-high/20 rounded transition-colors"
        >
          <X className="w-4 h-4 text-risk-high" />
        </button>
      )}
    </div>
  );
}
