import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import FinancialPage from './pages/FinancialPage';

import ResourceManagementPage from './pages/ResourceManagementPage';
import ProjectDetails from './pages/ProjectDetails';
import MyWorkPage from './pages/MyWorkPage';

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
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Navigate to="/dashboard/projects" replace /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/projects"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/departments"
            element={
              <ProtectedRoute>
                <DepartmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/financials"
            element={
              <ProtectedRoute>
                <FinancialPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/resources"
            element={
              <ProtectedRoute>
                <ResourceManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-work"
            element={
              <ProtectedRoute>
                <MyWorkPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
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
