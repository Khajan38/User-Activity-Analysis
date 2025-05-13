import { 
     BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
     PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {StatCard, Card} from './visualization_cards.js'
import './CSS/visualization.css'

const categoryData = [
  { name: "Work", count: 487 },
  { name: "Personal", count: 231 },
  { name: "Promotions", count: 342 },
  { name: "Updates", count: 198 },
  { name: "Social", count: 176 },
];

const topSendersData = [
  { name: "linkedin@mail.linkedin.com", count: 47 },
  { name: "newsletter@medium.com", count: 34 },
  { name: "team@github.com", count: 29 },
  { name: "no-reply@amazon.com", count: 26 },
  { name: "notifications@slack.com", count: 24 },
  { name: "news@nytimes.com", count: 21 },
  { name: "support@stackoverflow.com", count: 18 },
];

const sentimentData = [
  { name: "Positive", count: 642, color: "#4CAF50" },
  { name: "Neutral", count: 524, color: "#2196F3" },
  { name: "Negative", count: 268, color: "#F44336" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];

const emailTrendData = [
  { date: "Jan", count: 120 },
  { date: "Feb", count: 145 },
  { date: "Mar", count: 132 },
  { date: "Apr", count: 167 },
  { date: "May", count: 139 },
  { date: "Jun", count: 152 },
  { date: "Jul", count: 178 },
];

export const OverviewContent = () => {
  const totalEmails = 1434;
  return (
    <div>
      <h2 className="page-title">Dashboard Overview</h2>
      <div className="cards-grid">
        <StatCard title="Total Emails Analyzed" value={totalEmails} />
        <StatCard title="Model Accuracy" value="87.4%" />
        <StatCard title="Processing Time" value="1.4s" />
      </div>

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
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563EB"
                  fill="#93C5FD"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
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
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Sentiment Analysis">
        <div className="sentiment-container">
          {sentimentData.map((item) => (
            <div key={item.name} className="sentiment-item">
              <div
                className="sentiment-icon"
                style={{ backgroundColor: item.color }}
              >
                {item.name === "Positive" && <span>😃</span>}
                {item.name === "Neutral" && <span>😐</span>}
                {item.name === "Negative" && <span>😞</span>}
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