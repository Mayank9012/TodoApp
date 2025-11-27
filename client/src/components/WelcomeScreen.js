import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeScreen.css';

function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-background">
        <div className="pattern pattern-top"></div>
        <div className="pattern pattern-bottom"></div>
      </div>
      <div className="welcome-content">
        <h1 className="welcome-title">Manage What To Do</h1>
        <p className="welcome-subtitle">The best way to manage what you have to do, don't forget your plans</p>
        <button className="get-started-btn" onClick={() => navigate('/home')}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
