import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import './Dashboard.css';

// Sample data for charts
const categoryData = [
  { name: 'Work', count: 487 },
  { name: 'Personal', count: 231 },
  { name: 'Promotions', count: 342 },
  { name: 'Updates', count: 198 },
  { name: 'Social', count: 176 }
];

const topSendersData = [
  { name: 'linkedin@mail.linkedin.com', count: 47 },
  { name: 'newsletter@medium.com', count: 34 },
  { name: 'team@github.com', count: 29 },
  { name: 'no-reply@amazon.com', count: 26 },
  { name: 'notifications@slack.com', count: 24 },
  { name: 'news@nytimes.com', count: 21 },
  { name: 'support@stackoverflow.com', count: 18 }
];

const sentimentData = [
  { name: 'Positive', count: 642, color: '#4CAF50' },
  { name: 'Neutral', count: 524, color: '#2196F3' },
  { name: 'Negative', count: 268, color: '#F44336' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

// Email volume trend
const emailTrendData = [
  { date: 'Jan', count: 120 },
  { date: 'Feb', count: 145 },
  { date: 'Mar', count: 132 },
  { date: 'Apr', count: 167 },
  { date: 'May', count: 139 },
  { date: 'Jun', count: 152 },
  { date: 'Jul', count: 178 }
];


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

const Card = ({ title, children }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => {
  return (
    <div className="stat-card">
      <p className="stat-label">{title}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
};

const OverviewContent = () => {
  const totalEmails = 1434;
  
  return (
    <div>
      {/* Stats Cards */}
      <div className="cards-grid">
        <StatCard 
          title="Total Emails Analyzed" 
          value={totalEmails}
        />
        <StatCard 
          title="Model Accuracy" 
          value="87.4%" 
        />
        <StatCard 
          title="Processing Time" 
          value="1.4s" 
        />
      </div>
      
      {/* Charts First Row */}
      <div className="cards-grid">
        <Card title="Email Categories">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Email Volume Trend">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emailTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#2563EB" fill="#93C5FD" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Charts Second Row */}
      <div className="cards-grid">
        <Card title="Category Distribution">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Top Senders">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSendersData.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Sentiment Preview */}
      <Card title="Sentiment Analysis">
        <div className="sentiment-container">
          {sentimentData.map((item) => (
            <div key={item.name} className="sentiment-item">
              <div 
                className="sentiment-icon" 
                style={{ backgroundColor: item.color }}
              >
                {item.name === 'Positive' && <span>😃</span>}
                {item.name === 'Neutral' && <span>😐</span>}
                {item.name === 'Negative' && <span>😞</span>}
              </div>
              <div className="sentiment-details">
                <h3 className="sentiment-title">{item.name}</h3>
                <p className="sentiment-count">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const GmailAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <h1>Gmail Analytics</h1>
        <div className="user-info">
          <span>example@gmail.com</span>
          <div className="user-avatar">
            EA
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
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
                label="Senders" 
                active={activeTab === 'senders'} 
                onClick={() => setActiveTab('senders')} 
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

        {/* Main Content */}
        <main className="main-content">
          <h2 className="page-title">Dashboard Overview</h2>

          {activeTab === 'overview' && <OverviewContent />}

          {activeTab === 'senders' && (
            <div>Senders Analysis</div>
          )}

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