import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import BlogHome from './pages/BlogHome';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import TodayMatchesPage from './pages/TodayMatchesPage';
import LiveMatchesPage from './pages/LiveMatchesPage';
import BlogPost from './pages/BlogPost';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { Layout } from './components/layout/Layout';


const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={BlogHome} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/hesabim" component={DashboardPage} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/kategori/:slug" component={CategoryPage} />
      <Route path="/manuel" component={Home} />
      <Route path="/bugun" component={TodayMatchesPage} />
      <Route path="/canli" component={LiveMatchesPage} />
      <Route path="/Canlı" component={LiveMatchesPage} />
      <Route path="/CANLI" component={LiveMatchesPage} />
      <Route path="/canli-tv" component={LiveMatchesPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="*">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white">Sayfa bulunamadı</p>
        </div>
      </Route>
    </Switch>
    </Layout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
