import React, { useState } from 'react';
import Logo from '../assets/Logo.jpg';
import User from '../assets/User.jpg';
import { ChartIcon, PersonIcon, InfoIcon, DownloadIcon, SpamIcon, MeetingIcon, MLInsightsIcon} from './icons.js'
import './CSS/dashboard.css';
import OverviewContent from './overview.js'
import CalenderApp from './calendar.js'
import SpamModel from './spam_classifier.js';
import MeetingModel from './meetings_classifier.js';
import About from './about.js';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  const [activeTab, setActiveTab] = useState('about');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userEmail, setUserEmail] = useState('example@gmail.com');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [mlInsightsExpanded, setMlInsightsExpanded] = useState(false);
  const [activeMLSubTab, setActiveMLSubTab] = useState('spam_classifier_model');

  const handleLoginClick = async () => {
    setLoading("Logging In...");
    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
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
      console.error('Error occured during login:', error);
      setError("Error during Login");
    }setLoading(null); setActiveTab('overview');
  };

  const handleLogoutClick = async () => {
    setError("Logging Out...");
    try {
      const response = await fetch(`${BASE_URL}/api/logout`, {
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
    }setError(null); setActiveTab('overview');
  };  
  
  async function handleExport(user_email) {
    if (user_email === "example@gmail.com") {
      alert("Export is disabled for this user.");
      return;
    }
    const confirmSend = window.confirm("Send the Analysis direclty to your mail?");
    if (confirmSend) {
      try {
        await fetch('/api/send-export-mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: user_email }),
        });
        alert("Mail sent successfully!");
      } catch (error) {
        console.error("Mail sending failed:", error);
        alert("Failed to send mail.");
      }
    }
  }

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
          <img className="logo" src={Logo} alt="App Logo"/>
          <h1>COGNITICK.AI</h1>
        </div>
        <div className="user-info" onClick={() => setDropdownVisible(!dropdownVisible)}>
          <span>{userEmail}</span>
          <img src={User} alt={User} className="user-avatar" />
          {dropdownVisible && (
            <div className="dropdown-menu">
              <button onClick={handleLoginClick } disabled={userEmail !== 'example@gmail.com'}>Login</button>
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
                label="About" 
                active={activeTab === 'about'} 
                onClick={() => {setActiveTab('about');  setMlInsightsExpanded(false);}} 
                icon={<InfoIcon />}
              />
              <NavItem 
                label="Overview" 
                active={activeTab === 'overview'} 
                onClick={() => {setActiveTab('overview');  setMlInsightsExpanded(false);}} 
                icon={<ChartIcon />}
              />
              <NavItem 
                label="Meetings Calendar" 
                active={activeTab === 'meetings_calendar'} 
                onClick={() => {setActiveTab('meetings_calendar'); setMlInsightsExpanded(false);}}
                icon={<PersonIcon />}
              />
              <NavItem 
                label="ML Insights" 
                active={activeTab === 'insights'} 
                onClick={() => {
                  setMlInsightsExpanded(prev => !prev);
                  setActiveTab('insights');
                  if (!mlInsightsExpanded) setActiveMLSubTab('spam_classifier_model');
                }} 
                icon={<MLInsightsIcon />}
              />
              {mlInsightsExpanded && activeTab === 'insights' && (
                <div className="sub-tabs">
                  <NavItem 
                    label="Spam Classifier" 
                    active={activeMLSubTab === 'spam_classifier_model'} 
                    onClick={() => setActiveMLSubTab('spam_classifier_model')} 
                    icon={<SpamIcon />}
                  />
                  <NavItem 
                    label="Meeting Classifier" 
                    active={activeMLSubTab === 'meeting_classifier_model'} 
                    onClick={() => setActiveMLSubTab('meeting_classifier_model')} 
                    icon={<MeetingIcon />}
                  />
                </div>
              )}
              <div className={userEmail === "example@gmail.com" ? "closeExport" : ""}>
              <NavItem 
                label="Export" 
                active={activeTab === 'export'} 
                onClick={() => {
                  if (userEmail === "example@gmail.com") {
                    alert("Please login first");
                    return;
                  }
                  handleExport(userEmail); 
                  setActiveTab('export'); 
                  setMlInsightsExpanded(false);
                }}                
                icon={<DownloadIcon />}
              /></div>
            </div>
          </nav>
        </aside>
        <main className="main-content">
          {activeTab === 'about' && <About />}
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'meetings_calendar' && <CalenderApp />}
          {activeTab === 'insights' && (
            <>
              {activeMLSubTab === 'spam_classifier_model' && <SpamModel/>}
              {activeMLSubTab === 'meeting_classifier_model' && <MeetingModel/>}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default GmailAnalyticsDashboard;