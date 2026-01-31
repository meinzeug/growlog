import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Grows } from './pages/Grows';
import { Plants } from './pages/Plants';
import { Tasks } from './pages/Tasks';
import { Reports } from './pages/Reports';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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
        <Route path="plants" element={<Plants />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
        <Route path="admin/users" element={<div>Coming Soon: Users</div>} />
      </Route>
    </Routes>
  );
}

export default App;
