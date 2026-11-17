import React from 'react';

interface NavbarProps {
  backendUrl: string;
  isBackendHealthy: boolean | null;
  onRefresh: () => void;
  isLoading: boolean;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendUrl,
  isBackendHealthy,
  onRefresh,
  isLoading,
  isDemoMode,
  onToggleDemoMode,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-logo">💳</span>
          <div>
            <h1 className="brand-title">Expense Tracker</h1>
            <span className="brand-subtitle">Spring Boot &amp; React Full-Stack Application</span>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Mode Switcher */}
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-btn ${!isDemoMode ? 'active' : ''}`}
              onClick={() => {
                if (isDemoMode) onToggleDemoMode();
              }}
              title="Connect directly to Spring Boot backend on port 8080"
            >
              <span
                className={`status-dot ${
                  isBackendHealthy === true
                    ? 'status-online'
                    : isBackendHealthy === false
                    ? 'status-offline'
                    : 'status-pending'
                }`}
              />
              Live API
            </button>
            <button
              type="button"
              className={`mode-btn ${isDemoMode ? 'active demo-active' : ''}`}
              onClick={() => {
                if (!isDemoMode) onToggleDemoMode();
              }}
              title="Switch to Demo Sandbox Mode (offline interactive testing)"
            >
              ⚡ Demo Mode
            </button>
          </div>

          {!isDemoMode && (
            <div className="backend-status-pill">
              <span className="backend-info">
                Host: <code>{backendUrl || 'Vite Proxy'}</code>
              </span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            disabled={isLoading}
            title="Reload data"
          >
            {isLoading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
};
