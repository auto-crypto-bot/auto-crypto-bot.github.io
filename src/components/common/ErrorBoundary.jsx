import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app)',
            padding: '1rem'
        }}>
            <Card style={{ maxWidth: '400px', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                <AlertTriangle size={48} color="#ff4d4d" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {error.message || "An unexpected error occurred."}
                </p>
                <Button onClick={resetErrorBoundary} variant="primary" icon={<RefreshCcw size={16} />}>
                    Reload Application
                </Button>
            </Card>
        </div>
    );
};

export const AppErrorBoundary = ({ children }) => {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
            {children}
        </ErrorBoundary>
    );
};
