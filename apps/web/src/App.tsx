import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Grows } from './pages/Grows';
import { GrowDetail } from './pages/GrowDetail';
import { Plants } from './pages/Plants';
import { PlantDetail } from './pages/PlantDetail';
import { Tasks } from './pages/Tasks';
import { Reports } from './pages/Reports';
import { Tools } from './pages/Tools';
import { Settings } from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Could be a nicer spinner
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="grows" element={<Grows />} />
        <Route path="grows/:id" element={<GrowDetail />} />
        <Route path="plants" element={<Plants />} />
        <Route path="plants/:id" element={<PlantDetail />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
        <Route path="tools" element={<Tools />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin/users" element={<div>Coming Soon: Users</div>} />
      </Route>
    </Routes>
  );
}

export default App;
