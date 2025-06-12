// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">CalmAsana</h1>
          <nav className="space-x-6">
            <a href="#features" className="text-gray-700 hover:text-indigo-600">Features</a>
            <a href="#about" className="text-gray-700 hover:text-indigo-600">About</a>
            <Link to="/auth" className="text-indigo-600 font-semibold hover:underline">
              Login
            </Link>
            <Link
              to="/auth"
              className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="text-center py-24 bg-indigo-100">
        <h2 className="text-4xl md:text-5xl font-bold text-indigo-800 mb-4">
          Personalized Yoga. Anywhere.
        </h2>
        <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
          Get real-time feedback, track your progress, and improve your yoga practice — all from the comfort of your home.
        </p>
        <Link to="/auth" className="get-started-btn">
          Get Started
        </Link>
      </section>

      <section id="features" className="py-20 bg-white text-center">
        <h3 className="text-3xl font-bold mb-10 text-gray-800">Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🧘 Personalized Routines</h4>
            <p>Custom yoga plans based on your health, age, and goals.</p>
          </div>
          <div className="feature-card">
            <h4>📹 Real-Time Pose Feedback</h4>
            <p>AI-powered posture correction using your webcam.</p>
          </div>
          <div className="feature-card">
            <h4>📊 Progress Reports</h4>
            <p>Track your improvement over time.</p>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-gray-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-3xl font-bold mb-4 text-gray-800">About CalmAsana</h3>
          <p className="text-gray-700 text-lg">
            CalmAsana helps you practice yoga safely at home with AI-based feedback, personalized routines, and progress tracking.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><Link to="/auth">Login / Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4>Connect with Us</h4>
            <p>Email: support@calmasana.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                Facebook
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 CalmAsana. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;