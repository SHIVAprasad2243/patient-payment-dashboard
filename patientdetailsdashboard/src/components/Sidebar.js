import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar">
      <button
        className={`sidebar-link ${activeTab === 'patients' ? 'active' : ''}`}
        type="button"
        onClick={() => setActiveTab('patients')}
      >
        <span className="sidebar-icon">📊</span>
        Dashboard
      </button>
      <button
        className={`sidebar-link ${activeTab === 'transfer' ? 'active' : ''}`}
        type="button"
        onClick={() => setActiveTab('transfer')}
      >
        <span className="sidebar-icon">🔄</span>
        Transfer
      </button>
    </aside>
  );
};

export default Sidebar;
