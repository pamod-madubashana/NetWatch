import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function AppShell() {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
