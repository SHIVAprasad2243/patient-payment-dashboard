import React from 'react';

const Navbar = ({ session, userRole, showProfileMenu, setShowProfileMenu, handleLogout, loading }) => {
  return (
    <nav className="top-navbar">
      <div className="hospital-brand">
        <img 
          src="/images.jpg" 
          alt="Hospital Logo" 
          className="navbar-logo"
        />
        <div className="brand-labels">
          <strong>SIDDHARTHA NURSING HOME</strong>
          <span style={{ display: 'block', fontSize: '0.75rem' }}>Patient Management Dashboard</span>
        </div>
      </div>
      <div className="navbar-actions">
        <div className="profile-wrapper" style={{ position: 'relative' }}>
          <div className="profile-container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="profile-trigger" 
              style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '50%', 
                background: 'rgba(255, 255, 255, 0.2)', 
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                color: 'white'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu(!showProfileMenu);
              }}
            >
              <div className="profile-initial" style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>
                {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
              </div>
            </button>
          </div>
          
          {showProfileMenu && (
            <div className="profile-dropdown" style={{ 
              position: 'absolute', 
              right: 0, 
              top: '100%', 
              marginTop: '10px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              padding: '12px',
              minWidth: '180px',
              zIndex: 1001
            }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ 
                  backgroundColor: '#f0fdfa', 
                  color: '#0f766e', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  border: '1px solid #ccfbf1'
                }}>
                  {userRole || 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="logout-button-modern"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  textAlign: 'left', 
                  border: 'none', 
                  background: 'transparent', 
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontWeight: '600',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
