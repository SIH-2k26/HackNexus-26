import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';
import { ProtectedRoute } from '@/components/protected-route';
import { FederatedLearningProvider } from '@/lib/federated-learning-provider';
import Landing from '@/pages/landing';
import CommandCenter from '@/pages/command-center';
import Banks from '@/pages/banks';
import GlobalModel from '@/pages/global-model';
import Audit from '@/pages/audit';
import Settings from '@/pages/settings';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/">
        {() => (
          <Layout>
            <ProtectedRoute component={CommandCenter} allowedRoles={['operator']} />
          </Layout>
        )}
      </Route>
      <Route path="/banks">
        {() => (
          <Layout>
            <ProtectedRoute component={Banks} allowedRoles={['operator', 'bank']} />
          </Layout>
        )}
      </Route>
      <Route path="/global-model">
        {() => (
          <Layout>
            <ProtectedRoute component={GlobalModel} allowedRoles={['operator']} />
          </Layout>
        )}
      </Route>
      <Route path="/audit">
        {() => (
          <Layout>
            <ProtectedRoute component={Audit} allowedRoles={['operator', 'bank']} />
          </Layout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <Layout>
            <ProtectedRoute component={Settings} allowedRoles={['operator']} />
          </Layout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FederatedLearningProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </FederatedLearningProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
