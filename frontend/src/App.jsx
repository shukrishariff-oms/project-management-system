import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import FinancialPage from './pages/FinancialPage';
import SettingsPage from './pages/SettingsPage';
import ResourceManagementPage from './pages/ResourceManagementPage';
import ProjectDetails from './pages/ProjectDetails';
import MyWorkPage from './pages/MyWorkPage';
import DashboardLayout from './components/DashboardLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  // Clear legacy/seed data from localStorage on app load
  React.useEffect(() => {
    localStorage.removeItem('dept_staff_list');
    localStorage.removeItem('dept_identity_profile');
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard/projects" replace />} />
            <Route path="projects" element={<Dashboard />} />
            <Route path="departments" element={<DepartmentDashboard />} />
            <Route path="financials" element={<FinancialPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="resources" element={<ResourceManagementPage />} />
            <Route path="my-work" element={<MyWorkPage />} />
          </Route>

          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProjectDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
