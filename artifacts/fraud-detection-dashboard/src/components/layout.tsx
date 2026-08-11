import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Database, Shield, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { path: '/', label: 'Command Center', icon: Activity },
    { path: '/banks', label: 'Bank Network', icon: Database },
    { path: '/checker', label: 'Fraud Checker', icon: Shield },
    { path: '/settings', label: 'System Config', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('vaultic_auth_role');
    localStorage.removeItem('vaultic_auth_session');
    setShowProfileMenu(false);
    alert('Logged out from Vaultic Admin Session');
  };

  return (
    <div className="min-h-[100dvh] flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground">Vaultic</h1>
              <p className="text-[11px] text-muted-foreground font-medium leading-tight mt-0.5">
                Enterprise Federated Fraud Intelligence
              </p>
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
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
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
          <div className="px-4 py-3 bg-card rounded-lg border border-card-border shadow-xs">
            <p className="text-xs font-medium text-muted-foreground mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
              <span className="text-xs font-mono font-medium">All nodes operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area with Top Navigation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar with Profile Dropdown */}
        <header className="h-14 border-b border-border bg-card px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-chart-2" />
            <span>Connected to Local Federated Aggregator</span>
          </div>

          {/* User Profile Component */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-accent/50 transition-all border border-border/50 text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                </div>
                <span className="text-[10px] text-muted-foreground block -mt-0.5">Online</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl p-1.5 z-50">
                <div className="px-3 py-2 border-b border-border/50 mb-1">
                  <p className="text-xs font-semibold text-foreground">System Administrator</p>
                  <p className="text-[11px] text-muted-foreground">admin@vaultic.io</p>
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md text-foreground hover:bg-accent transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md text-foreground hover:bg-accent transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md text-destructive hover:bg-destructive/10 transition-colors border-t border-border/50 mt-1 pt-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
