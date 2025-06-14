import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  // State to manage which feature's explanation is visible
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Feature data with explanations
  const features = [
    {
      title: '🧘 Personalized Routines',
      description: 'Receive custom yoga plans tailored to your age, health conditions, fitness level, and goals for a safe and effective practice.',
      content: 'Custom yoga plans based on your health, age, and goals.',
    },
    {
      title: '📹 Real-Time Pose Feedback',
      description: 'Use your webcam to get AI-powered feedback on your posture, ensuring proper alignment and reducing injury risk during practice.',
      content: 'AI-powered posture correction using your webcam.',
    },
    {
      title: '📊 Progress Reports',
      description: 'Track your yoga journey with detailed reports, including performance metrics and improvement trends, to stay motivated.',
      content: 'Track your improvement over time.',
    },
  ];

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
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              onClick={() => setSelectedFeature(feature.title === selectedFeature ? null : feature.title)}
            >
              <h4>{feature.title}</h4>
              <p>{feature.content}</p>
              {selectedFeature === feature.title && (
                <div className="feature-explanation">
                  <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="py-20 bg-gray-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-3xl font-bold mb-4 text-gray-800">About CalmAsana</h3>
          <p className="text-gray-700 text-lg">
            Discover a personalized yoga experience designed just for you. With AI-powered feedback, custom routines tailored to your needs, and progress tracking, CalmAsana helps you practice safely and effectively from home. Start your journey to wellness today!
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