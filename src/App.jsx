import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="navbar">
          <h2>SkillPortal</h2>
          <nav>
            <a href="/">Home</a>
            <a href="/login">Login</a>
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
            <Route path="/login" element={<div><h2>Login Mockup</h2></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
