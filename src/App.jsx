import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import WorkoutBuilderPage from './pages/WorkoutBuilderPage';
import MealBuilderPage from './pages/MealBuilderPage';
import KnowledgePage from './pages/KnowledgePage';
import UsagePage from './pages/UsagePage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPricingPage from './pages/AdminPricingPage';
import AdminDesignPage from './pages/AdminDesignPage';
import { adminService } from './services/supabase';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  useEffect(() => {
    const init = async () => {
      // Initialize tiers
      const { tierGuard } = await import('./services/tierGuard');
      await tierGuard.initTiers();

      // Initialize theme
      try {
        const theme = await adminService.getPlatformSettings('theme');
        if (theme) {
          applyTheme(theme);
        }
      } catch (err) {
        console.error('Failed to load theme:', err);
      }
    };
    init();
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const props = {
      '--accent-cyan': theme.accent_cyan,
      '--accent-teal': theme.accent_teal,
      '--accent-blue': theme.accent_blue,
      '--accent-violet': theme.accent_violet,
      '--accent-pink': theme.accent_pink,
      '--bg-primary': theme.bg_primary,
      '--bg-secondary': theme.bg_secondary,
    };

    Object.entries(props).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });

    if (theme.font_heading) {
      root.style.setProperty('--font-heading', `'${theme.font_heading}', 'Inter', sans-serif`);
    }
    if (theme.font_body) {
      root.style.setProperty('--font-body', `'${theme.font_body}', sans-serif`);
    }

    // Update gradients based on new colors
    const cyan = theme.accent_cyan || '#06d6a0';
    const blue = theme.accent_blue || '#4361ee';
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${cyan}, ${blue})`);
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="workouts" element={<WorkoutBuilderPage />} />
        <Route path="meals" element={<MealBuilderPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="usage" element={<UsagePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/pricing" element={<AdminPricingPage />} />
        <Route path="admin/design" element={<AdminDesignPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
