import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  allowedRoles?: ('operator' | 'bank')[];
}

export function ProtectedRoute({ component: Component, allowedRoles }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const rawSession = localStorage.getItem('vaultic_auth_session');
    if (!rawSession) {
      setAuthorized(false);
      setLocation('/landing');
      return;
    }

    try {
      const session = JSON.parse(rawSession);
      if (!session || !session.authenticated || !session.apiKey) {
        setAuthorized(false);
        setLocation('/landing');
        return;
      }

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
        // Role mismatch redirect
        setAuthorized(false);
        if (session.role === 'bank') {
          setLocation('/banks');
        } else {
          setLocation('/landing');
        }
        return;
      }

      setAuthorized(true);
    } catch (e) {
      setAuthorized(false);
      setLocation('/landing');
    }
  }, [setLocation, allowedRoles]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-mono">Verifying Vaultic Auth Session...</p>
        </div>
      </div>
    );
  }

  return authorized ? <Component /> : null;
}
