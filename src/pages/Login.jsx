import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to your SkillPortal account</p>
        
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-input" type="email" id="email" placeholder="you@example.com" required />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-input" type="password" id="password" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="primary-btn full-width">Login</button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
