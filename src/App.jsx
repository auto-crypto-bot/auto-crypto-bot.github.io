import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Radio, BarChart2, Settings as SettingsIcon, Zap } from 'lucide-react';
import Home from './pages/Home';
import Live from './pages/Live';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AppErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/ToastProvider';
import { useBotStatus } from './hooks/useBotStatus'; // Hook usage

// Main Content
const AppContent = () => {
  const location = useLocation();
  const { botStatus } = useBotStatus(); // Use the hook

  // If on login page, don't show the sidebar layout
  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <nav className="sidebar-container">
        {/* Logo Section */}
        <div className="sidebar-logo">
          <Zap size={28} color="#00ff88" fill="#00ff88" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,136,0.5))' }} />
          <span className="logo-text">BotDash</span>
        </div>

        {/* Status Badge */}
        <div className={`sidebar-status ${botStatus?.toLowerCase() || 'stopped'}`}>
          <span className={`status-text ${botStatus?.toLowerCase() || 'stopped'}`}>{botStatus || 'UNKNOWN'}</span>
          <div className={`status-dot ${botStatus?.toLowerCase() || 'stopped'}`}></div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Home" active={location.pathname === '/'} />
          <NavLink to="/live" icon={<Radio size={20} />} label="Live" active={location.pathname === '/live'} />
          <NavLink to="/analytics" icon={<BarChart2 size={20} />} label="Analytics" active={location.pathname === '/analytics'} />
          <NavLink to="/settings" icon={<SettingsIcon size={20} />} label="Settings" active={location.pathname === '/settings'} />
        </div>
      </nav>

      <main className="app-main">
        <AppErrorBoundary>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/live" element={<Live />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            {/* Fallback to login if unknown route? Or Home which redirects */}
            <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          </Routes>
        </AppErrorBoundary>
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`nav-link ${active ? 'active' : ''}`}>
    {icon}
    <span>{label}</span>
    {active && <div className="active-indicator" />}
  </Link>
);

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider />
      <AppContent />
    </Router>
  );
};

export default App;
