import React from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join SkillPortal and show your true skills</p>
        
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input className="form-input" type="text" id="fullName" placeholder="John Doe" required />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-input" type="email" id="email" placeholder="you@example.com" required />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-input" type="password" id="password" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="primary-btn full-width">Sign Up</button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
