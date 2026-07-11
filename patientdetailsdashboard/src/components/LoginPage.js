import React from 'react';

const LoginPage = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  showPassword, 
  setShowPassword, 
  handleLogin, 
  handleSignUp, 
  loading, 
  message 
}) => {
  return (
    <main className="auth-page">
      <div className="auth-container">
        <aside className="auth-sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo-container">
              <img 
                src="/images.jpg" 
                alt="Buddha Logo" 
                className="buddha-logo"
              />
            </div>
            <div className="brand-text">
              <h2>SIDDHARTHA</h2>
              <h2>NURSING HOME</h2>
            </div>
          </div>
          <p className="sidebar-tagline">Care You Can Trust</p>
          
          <div className="sidebar-image-container">
            <img 
              src="/clipboard4.png" 
              alt="Medical Clipboard" 
              className="sidebar-medical-img" 
            />
          </div>

          <div className="sidebar-footer">
            <p className="footer-headline">Your health, our priority.</p>
            <p className="footer-subline">We are here for you always.</p>
            
            <div className="contact-info">
              <div className="contact-item">
                <span className="icon">📍</span>
                <p>Siddhartha Nursing Home, Vidyanagar, Choutuppal, Yadadri Bhuvanagiri - 508252</p>
              </div>
              <div className="contact-item">
                <span className="icon">📞</span>
                <p>+91 9912033193</p>
              </div>
              <div className="contact-item">
                <span className="icon">✉️</span>
                <p>siddharthanursinghome.333@gmail.com</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="auth-content">
          <div className="auth-header">
            <h1>Sign in</h1>
            <p>Access your patient records with your registered email and password.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email address</label>
              <div className="input-with-icon">
                <input
                  id="email"
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength="6"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {message && <p className="status-message">{message}</p>}

            <button className="auth-primary-button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <button type="button" className="forgot-password">Forgot password?</button>
          </form>

          <button
            className="auth-secondary-button"
            type="button"
            onClick={handleSignUp}
            disabled={true}
            title="Registration is currently disabled"
          >
            Create account
          </button>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
