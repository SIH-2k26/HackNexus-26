import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Database, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: 'Command Center', icon: Activity },
    { path: '/banks', label: 'Bank Network', icon: Database },
    { path: '/checker', label: 'Fraud Checker', icon: Shield },
    { path: '/settings', label: 'System Config', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Vaultic API</h1>
              <p className="text-xs text-muted-foreground font-mono">v.0.0.1</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
                data-testid={`nav-${item.path === '/' ? 'home' : item.path.slice(1)}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="px-4 py-3 bg-card rounded-lg border border-card-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
              <span className="text-xs font-mono font-medium">All nodes operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
