import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, BarChart2, Settings, Zap } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/live', label: 'Live', icon: Radio },
        { path: '/analytics', label: 'Analytics', icon: BarChart2 },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="sidebar-container">
            <div className="sidebar-logo">
                <Zap size={24} fill="var(--accent-green)" />
                <span className="logo-text">BotDash</span>
            </div>

            <div className="sidebar-status">
                <span>Running</span>
                <div className="status-dot" />
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className="nav-icon" />
                                <span className="nav-label">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
