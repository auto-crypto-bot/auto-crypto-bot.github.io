import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, BarChart2, Settings, Zap, Wallet } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/live', label: 'Live', icon: Radio },
        { path: '/analytics', label: 'Analytics', icon: BarChart2 },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const walletAssets = [
        { symbol: 'BTC', balance: '0.45', value: '$29,500' },
        { symbol: 'USDC', balance: '12,500', value: '$12,500' },
    ];

    const styles = {
        sidebar: {
            width: '280px',
            height: '100%',
            // Deep gradient to match the dark graphite look
            background: 'linear-gradient(180deg, rgba(13, 17, 23, 0.95) 0%, rgba(13, 17, 23, 0.8) 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--accent-green)',
            textShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
            marginBottom: '2.5rem',
            letterSpacing: '0.5px',
        },
        status: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1rem',
            background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.03) 0%, rgba(0, 255, 136, 0.08) 100%)',
            border: '1px solid rgba(0, 255, 136, 0.15)',
            borderRadius: '12px',
            fontSize: '0.85rem',
            color: 'var(--accent-green)',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(0, 255, 136, 0.05)',
        },
        statusDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#00ff88',
            boxShadow: '0 0 8px #00ff88, 0 0 16px #00ff88',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        nav: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            flex: 1,
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#8b949e',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem',
            fontWeight: '500',
            border: '1px solid transparent',
        },
        activeLink: {
            background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.02) 100%)',
            color: '#ffffff',
            border: '1px solid rgba(0, 255, 136, 0.1)',
            borderLeft: '3px solid var(--accent-green)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
        // Option A: Seamless Integration
        walletSection: {
            marginTop: 'auto',
            padding: '1.5rem',
            // Very subtle gradient to distinguish the area without being a card
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
        },
        walletHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            color: '#8b949e',
            fontSize: '0.8rem',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
        },
        totalBalance: {
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '1.25rem',
            letterSpacing: '-0.03em',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        },
        assetList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
        },
        assetRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem',
            padding: '0.5rem 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
        },
        assetInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
        },
        assetIcon: {
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: '800',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>
                <Zap size={24} fill="var(--accent-green)" />
                <span style={{ background: 'linear-gradient(to right, #fff, #8b949e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BotDash</span>
            </div>

            <div style={styles.status}>
                <span>Running</span>
                <div style={styles.statusDot} />
            </div>

            <nav style={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            ...styles.link,
                            ...(isActive ? styles.activeLink : {})
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} color={isActive ? 'var(--accent-green)' : 'currentColor'} />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>


        </div>
    );
};

export default Sidebar;
