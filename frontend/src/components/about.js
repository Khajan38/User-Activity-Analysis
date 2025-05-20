import React from 'react';
import './CSS/about.css';

const AboutSection = () => {
  return (
    <div className="about-container">
      <h1>About COGNITICK.AI</h1>
      
      <section className="about-section">
        <h2>Project Overview</h2>
        <p>
          COGNITICK.AI is an intelligent user activity analysis platform that leverages 
          machine learning and natural language processing to provide actionable insights 
          from your email and calendar data. Our platform helps you understand communication 
          patterns, optimize meeting scheduling, and identify important messages.
        </p>
      </section>
      
      <section className="about-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Email Classification</h3>
            <p>Advanced spam detection and email categorization using Naive Bayes algorithms.</p>
          </div>
          <div className="feature-card">
            <h3>Meeting Intelligence</h3>
            <p>Smart meeting classification and calendar optimization recommendations.</p>
          </div>
          <div className="feature-card">
            <h3>Sentiment Analysis</h3>
            <p>Track communication sentiment trends over time for better relationship management.</p>
          </div>
          <div className="feature-card">
            <h3>Interactive Dashboard</h3>
            <p>Visual representation of insights with customizable reports and exports.</p>
          </div>
        </div>
      </section>
      
      <section className="about-section">
        <h2>Technology Stack</h2>
        <div className="tech-stack">
          <div className="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>React.js</li>
              <li>CSS</li>
              <li>JavaScript </li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Backend</h3>
            <ul>
              <li>Python</li>
              <li>Flask</li>
              <li>NLTK</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>ML/AI</h3>
            <ul>
              <li>Scikit-learn</li>
              <li>Naive Bayes Classifiers</li>
              <li>Natural Language Processing</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Deployment</h3>
            <ul>
              <li>Vercel</li>
              <li>Git/GitHub</li>
              <li>Environment Configuration</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="about-section">
        <h2>Testing Strategy</h2>
        <p>Our comprehensive testing approach includes:</p>
        <ul className="testing-list">
          <li><strong>Unit Testing:</strong> Backend component tests, ML model validation, data processing verification</li>
          <li><strong>Integration Testing:</strong> API endpoint testing, backend-frontend interaction validation</li>
          <li><strong>Frontend Testing:</strong> React component tests using Jest and React Testing Library</li>
          <li><strong>Data Validation:</strong> Input validation, dataset integrity checks, model I/O verification</li>
          <li><strong>Performance Testing:</strong> API response time measurement, model inference speed optimization</li>
        </ul>
      </section>
      
      <section className="about-section">
        <h2>Team</h2>
        <p>COGNITICK.AI was developed by  focusing  on creating intelligent productivity tools.</p>
      </section>
      
      <section className="about-section">
        <h2>Privacy & Security</h2>
        <p>We prioritize your data privacy and security. All email and calendar data is processed with strict confidentiality measures, and we never store your content permanently. Our application uses OAuth for secure authentication and applies industry-standard encryption practices.</p>
      </section>
      
      <div className="version-info">
        <p>Version: 1.0.0</p>
        <p>&copy; 2023-2025 COGNITICK.AI - All Rights Reserved</p>
      </div>
    </div>
  );
};

export default AboutSection;