import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2rem',
                position: 'relative'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
