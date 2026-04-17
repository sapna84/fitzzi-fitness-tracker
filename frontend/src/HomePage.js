import React from 'react';
import './HomePage.css';

function HomePage({ onGetStarted }) {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          Transform Your Life with<br />
          <span className="gradient-text">FITZZI</span>
        </h1>
        <p className="hero-subtitle">
          Track steps, monitor nutrition, get personalized advice, and achieve your fitness goals
        </p>
        <button className="cta-button" onClick={onGetStarted}>
          Get Started Free →
        </button>
      </div>

      <div className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👟</div>
            <h3>Step Tracking</h3>
            <p>Track your daily steps and stay active</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🥗</div>
            <h3>Diet Planning</h3>
            <p>Personalized meal plans for your goals</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💪</div>
            <h3>Fitness Advice</h3>
            <p>Expert workout recommendations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>BMI Calculator</h3>
            <p>Track your health metrics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Calorie Tracker</h3>
            <p>Monitor your daily intake</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Advice</h3>
            <p>AI-powered recommendations</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat">
          <h3>10K+</h3>
          <p>Active Users</p>
        </div>
        <div className="stat">
          <h3>1M+</h3>
          <p>Steps Tracked</p>
        </div>
        <div className="stat">
          <h3>500+</h3>
          <p>Meal Plans</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;