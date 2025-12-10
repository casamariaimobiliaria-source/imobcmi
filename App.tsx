
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppProvider';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { Agents } from './pages/Agents';
import { Finance } from './pages/Finance';
import { CashFlow } from './pages/CashFlow';
import { Clients } from './pages/Clients';
import { Developers } from './pages/Developers';
import { Projects } from './pages/Projects';
import { Categories } from './pages/Categories';
import { Reports } from './pages/Reports';
import { Calendar } from './pages/Calendar';
import { Pipeline } from './pages/Pipeline';
import { Users } from './pages/Users';
import { Profile } from './pages/Profile';
import { UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but has no organization, redirect to signup
  if (!user.organization_id) {
    return <Navigate to="/signup" replace />;
  }
  return <>{children}</>;
};

// Role Based Route Wrapper
const RoleRoute = ({ children, roles }: { children?: React.ReactNode, roles: UserRole[] }) => {
  const { user } = useApp();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="sales" element={<Sales />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin Only Routes */}
        <Route path="agents" element={<RoleRoute roles={['admin']}><Agents /></RoleRoute>} />
        <Route path="users" element={<RoleRoute roles={['admin']}><Users /></RoleRoute>} />
        <Route path="finance" element={<RoleRoute roles={['admin']}><Finance /></RoleRoute>} />
        <Route path="cash-flow" element={<RoleRoute roles={['admin']}><CashFlow /></RoleRoute>} />
        <Route path="clients" element={<RoleRoute roles={['admin', 'agent']}><Clients /></RoleRoute>} />
        <Route path="developers" element={<RoleRoute roles={['admin']}><Developers /></RoleRoute>} />
        <Route path="projects" element={<RoleRoute roles={['admin']}><Projects /></RoleRoute>} />
        <Route path="categories" element={<RoleRoute roles={['admin']}><Categories /></RoleRoute>} />
        <Route path="calendar" element={<RoleRoute roles={['admin', 'agent']}><Calendar /></RoleRoute>} />
        <Route path="pipeline" element={<RoleRoute roles={['admin', 'agent']}><Pipeline /></RoleRoute>} />

        {/* Reports accessible by both, but filtered inside */}
        <Route path="reports" element={<RoleRoute roles={['admin', 'agent']}><Reports /></RoleRoute>} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AppProvider>
    </ToastProvider>
  );
};

export default App;
