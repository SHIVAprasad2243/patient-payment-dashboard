import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, onNavigate = () => {} }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-title">Navigation</span>}
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '⟩' : '⟨'}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        <button
          className={`sidebar-link ${activeTab === 'patients' ? 'active' : ''}`}
          type="button"
          onClick={() => {
            setActiveTab('patients');
            onNavigate('/');
          }}
          aria-label="Dashboard"
        >
          <span className="sidebar-icon">📊</span>
          {!collapsed && <span className="sidebar-label">Dashboard</span>}
        </button>

        <button
          className={`sidebar-link ${activeTab === 'payment-history' ? 'active' : ''}`}
          type="button"
          onClick={() => {
            setActiveTab('payment-history');
            onNavigate('/payment-history');
          }}
          aria-label="Payment History"
        >
          <span className="sidebar-icon">💳</span>
          {!collapsed && <span className="sidebar-label">Payment History</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
