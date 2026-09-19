import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import BlogHome from './pages/BlogHome';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminBlogPage from './pages/AdminBlogPage';
import ApiManagementPage from './pages/ApiManagementPage';
import PredictionsPage from './pages/PredictionsPage';
import SuccessRatePage from './pages/SuccessRatePage';
import TodayMatchesPage from './pages/TodayMatchesPage';
import LiveMatchesPage from './pages/LiveMatchesPage';
import BlogPost from './pages/BlogPost';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UnsubscribePage from './pages/UnsubscribePage';
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
        <Route path="/unsubscribe/:hash" component={UnsubscribePage} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/kategori/:slug" component={CategoryPage} />
        <Route path="/bugun" component={TodayMatchesPage} />
        <Route path="/canli" component={LiveMatchesPage} />
        <Route path="/tahminlerim" component={PredictionsPage} />
        <Route path="/basari-orani" component={SuccessRatePage} />
        
        {/* Admin CMS Routes */}
        <Route path="/admin" component={AdminDashboardPage} />
        <Route path="/admin/database" component={AdminPage} />
        <Route path="/admin/users" component={AdminUsersPage} />
        <Route path="/admin/blog" component={AdminBlogPage} />
        <Route path="/admin/settings" component={AdminSettingsPage} />
        <Route path="/admin/api" component={ApiManagementPage} />
        
        <Route path="*">
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-slate-500">Sayfa bulunamadı</p>
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
