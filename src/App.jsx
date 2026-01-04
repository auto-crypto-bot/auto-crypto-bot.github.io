import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, Settings as SettingsIcon, Zap } from 'lucide-react';
import Home from './pages/Home';
import Live from './pages/Live';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const location = useLocation();

  // If on login page, don't show the sidebar layout
  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="logo-container">
          <Zap size={28} color="#00ff88" fill="#00ff88" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,136,0.5))' }} />
          <span className="logo-text">AutoBot</span>
        </div>

        <div className="nav-links">
          <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/'} />
          <NavLink to="/live" icon={<Activity size={20} />} label="Live Activity" active={location.pathname === '/live'} />
          <NavLink to="/analytics" icon={<Activity size={20} />} label="Analytics" active={location.pathname === '/analytics'} />
          <div style={{ flex: 1 }} />
          <NavLink to="/settings" icon={<SettingsIcon size={20} />} label="Settings" active={location.pathname === '/settings'} />
        </div>
      </nav>

      <main className="main-view">
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

export default App;
