import { Routes, Route } from 'react-router-dom';
import { FarmDataProvider } from './context/FarmDataContext';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Flocks from './pages/Flocks';
import DailyRecords from './pages/DailyRecords';
import HealthMonitoring from './pages/HealthMonitoring';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Recommendations from './pages/Recommendations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <FarmDataProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/flocks" element={<Flocks />} />
          <Route path="/daily-records" element={<DailyRecords />} />
          <Route path="/health-monitoring" element={<HealthMonitoring />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </FarmDataProvider>
  );
}

export default App;
