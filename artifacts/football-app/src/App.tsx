import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import TodayMatchesPage from './pages/TodayMatchesPage';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/bugun" component={TodayMatchesPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="*">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white">Sayfa bulunamadı</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
