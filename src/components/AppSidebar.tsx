import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Network, 
  Info, 
  Settings,
  ChevronLeft,
  Activity
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard, shortcut: '⌘1' },
  { title: 'Connections', path: '/connections', icon: Network, shortcut: '⌘2' },
  { title: 'About', path: '/about', icon: Info, shortcut: '⌘3' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      'h-screen flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200',
      collapsed ? 'w-16' : 'w-56'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-foreground">NetWatch</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-hidden">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-sidebar-border flex-shrink-0">
        <button className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors',
          'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
        )}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        
        {!collapsed && (
          <p className="text-xs text-muted-foreground px-3 mt-3">v1.0.0</p>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center mt-2 p-2 rounded-lg w-full transition-colors',
            'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <ChevronLeft className={cn(
            'w-4 h-4 transition-transform',
            collapsed && 'rotate-180'
          )} />
        </button>
      </div>
    </aside>
  );
}
