import React from 'react';

const StatsCards = ({ totalPatients, monthlyPatients }) => {
  return (
    <div className="stats-container-inline">
      <div className="stat-card-inline">
        <span className="stat-label">Total Patients</span>
        <span className="stat-value">{totalPatients}</span>
      </div>
      <div className="stat-card-inline">
        <span className="stat-label">Added This Month</span>
        <span className="stat-value">{monthlyPatients}</span>
      </div>
    </div>
  );
};

export default StatsCards;
