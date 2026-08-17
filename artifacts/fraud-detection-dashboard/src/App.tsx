import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';
import { FederatedLearningProvider } from '@/lib/federated-learning-provider';
import CommandCenter from '@/pages/command-center';
import Banks from '@/pages/banks';
import GlobalModel from '@/pages/global-model';
import Audit from '@/pages/audit';
import Settings from '@/pages/settings';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={CommandCenter} />
        <Route path="/banks" component={Banks} />
        <Route path="/global-model" component={GlobalModel} />
        <Route path="/audit" component={Audit} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
