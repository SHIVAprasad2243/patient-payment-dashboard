import React from 'react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <button className="sidebar-link active" type="button">
        <span className="sidebar-icon">📊</span>
        Dashboard
      </button>
    </aside>
  );
};

export default Sidebar;
