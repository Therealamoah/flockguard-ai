import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FarmDataProvider } from './context/FarmDataContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import RequireAuth from './components/RequireAuth';
import GuestOnly from './components/GuestOnly';
import AdminRequireAuth from './components/AdminRequireAuth';
import AdminGuestOnly from './components/AdminGuestOnly';
import AppLayout from './layout/AppLayout';
import AuthLayout from './layout/AuthLayout';
import AdminLayout from './layout/AdminLayout';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import AcceptInvite from './pages/public/AcceptInvite';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Flocks from './pages/Flocks';
import DailyRecords from './pages/DailyRecords';
import HealthMonitoring from './pages/HealthMonitoring';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Recommendations from './pages/Recommendations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import Overview from './pages/admin/Overview';
import Farms from './pages/admin/Farms';
import FarmDetail from './pages/admin/FarmDetail';
import Users from './pages/admin/Users';
import Billing from './pages/admin/Billing';
import Activity from './pages/admin/Activity';

function App() {
  return (
    <AuthProvider>
      <FarmDataProvider>
        <AdminAuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route element={<GuestOnly />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>
            </Route>

            {/* Not GuestOnly-gated: reached via an emailed link regardless of
                whatever auth state the browser happens to already be in. */}
            <Route element={<AuthLayout />}>
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="flocks" element={<Flocks />} />
                <Route path="daily-records" element={<DailyRecords />} />
                <Route path="health-monitoring" element={<HealthMonitoring />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route element={<AdminGuestOnly />}>
              <Route path="/admin/login" element={<AdminLogin />} />
            </Route>

            <Route element={<AdminRequireAuth />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Overview />} />
                <Route path="farms" element={<Farms />} />
                <Route path="farms/:farmId" element={<FarmDetail />} />
                <Route path="users" element={<Users />} />
                <Route path="billing" element={<Billing />} />
                <Route path="activity" element={<Activity />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </FarmDataProvider>
    </AuthProvider>
  );
}

export default App;
