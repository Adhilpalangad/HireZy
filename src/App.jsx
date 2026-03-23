import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="navbar">
          <h2>SkillPortal</h2>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="primary-btn nav-signup-btn">Sign Up</Link>
          </nav>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={
              <div className="hero">
                <h1>Find Work Based on Pure Skill.</h1>
                <p>Welcome to the first strictly skill-based matching platform. Forget traditional qualifications. Get hired for what you can actually do.</p>
                <button className="primary-btn">Explore Opportunities</button>
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
