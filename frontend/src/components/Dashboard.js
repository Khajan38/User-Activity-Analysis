import React, { useState } from 'react';
import Logo from '../assets/Logo.jpg';
import User from '../assets/User.jpg';
import './CSS/dashboard.css';
import {OverviewContent} from './overview.js'
import CalenderApp from './calendar.js'

const ChartIcon = () => (
  <svg className="nav-item-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
  </svg>
);

const PersonIcon = () => (
  <svg className="nav-item-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" fillRule="evenodd"></path>
  </svg>
);

const SmileyIcon = () => (
  <svg className="nav-item-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" fillRule="evenodd"></path>
  </svg>
);

const InfoIcon = () => (
  <svg className="nav-item-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg className="nav-item-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg className="nav-item-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg className="nav-item-icon" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V9.5a1 1 0 00-2 0V15H4V5h10v2.5a1 1 0 002 0V4a1 1 0 00-1-1H3z" clipRule="evenodd"></path>
    <path d="M16 8a1 1 0 01-1 1H9v2.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L7 11.586V9H2a1 1 0 010-2h7V4a1 1 0 012 0v5z"></path>
  </svg>
);

// Reusable Components
const NavItem = ({ label, active, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`nav-item ${active ? 'active' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const GmailAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userEmail, setUserEmail] = useState('example@gmail.com');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleLoginClick = async () => {
    setLoading("Logging In...");
    try {
      const response = await fetch('https://cognitick-api.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      if (result.email) {
        setUserEmail(result.email);
        setDropdownVisible(false);
      } else {
        console.error('Login failed or email not returned');
        setError("Failed to Login");
        setLoading(null);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError("Error during Login");
    }setLoading(null);
  };

  const handleLogoutClick = async () => {
    setError("Logging Out...");
    try {
      const response = await fetch('https://cognitick-api.onrender.com/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.email) {
        setUserEmail(result.email);
        setDropdownVisible(false);
      } else {
        console.error('Logout failed');
        setError("Failed to Logout");
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setError("Error during Logout");
    }setError(null);  
  };  
  
  return (
    <div className="dashboard-container">
      {loading && (
        <>
          <div className="toast-overlay" />
          <div className="toast-message processing">Logging You In...</div>
        </>
      )}{error && (
        <>
          <div className="toast-overlay" onClick={() => {if (error !== "Logging Out...") setError(null);}}/>
          <div className="toast-message error" onClick={() => {if (error !== "Logging Out...") setError(null);}}>{error}</div>
        </>
      )}
      <header className="header">
        <div className="left-section">
          <img class="logo" src={Logo} alt="App Logo"/>
          <h1>COGNITICK.AI</h1>
        </div>
        <div className="user-info" onClick={() => setDropdownVisible(!dropdownVisible)}>
          <span>{userEmail}</span>
          <img src={User} alt={User} className="user-avatar" />
          {dropdownVisible && (
            <div className="dropdown-menu">
              <button onClick={handleLoginClick}>Login</button>
              <button onClick={handleLogoutClick} disabled={userEmail === 'example@gmail.com'}>Logout</button>
              <button disabled>Refresh</button>
            </div>
          )}
        </div>
      </header>
      
      <div className="dashboard-content">
        <aside className="sidebar">
          <nav>
            <div className="nav-items">
              <NavItem 
                label="Overview" 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
                icon={<ChartIcon />}
              />
              <NavItem 
                label="Meetings Calendar" 
                active={activeTab === 'meetings_calendar'} 
                onClick={() => setActiveTab('meetings_calendar')} 
                icon={<PersonIcon />}
              />
              <NavItem 
                label="Sentiment" 
                active={activeTab === 'sentiment'} 
                onClick={() => setActiveTab('sentiment')} 
                icon={<SmileyIcon />}
              />
              <NavItem 
                label="ML Insights" 
                active={activeTab === 'insights'} 
                onClick={() => setActiveTab('insights')} 
                icon={<InfoIcon />}
              />
              <NavItem 
                label="Export" 
                active={activeTab === 'export'} 
                onClick={() => setActiveTab('export')} 
                icon={<DownloadIcon />}
              />
              <NavItem 
                label="Settings" 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')} 
                icon={<SettingsIcon />}
              />
              <NavItem 
                label="Logout" 
                active={false} 
                onClick={() => {}} 
                icon={<LogoutIcon />}
              />
            </div>
          </nav>
        </aside>
        <main className="main-content">
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'meetings_calendar' && <CalenderApp />}

          {activeTab === 'sentiment' && (
            <div>Sentiment Analysis</div>
          )}

          {activeTab === 'insights' && (
            <div>ML Insights</div>
          )}

          {activeTab === 'export' && (
            <div>Export Data</div>
          )}

          {activeTab === 'settings' && (
            <div>Settings</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GmailAnalyticsDashboard;