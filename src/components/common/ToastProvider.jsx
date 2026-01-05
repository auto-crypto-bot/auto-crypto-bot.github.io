import React from 'react';
import { Toaster } from 'sonner';

export const ToastProvider = () => {
    return (
        <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
                style: {
                    background: 'var(--bg-card)',
                    border: 'var(--glass-border)',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                },
            }}
        />
    );
};
