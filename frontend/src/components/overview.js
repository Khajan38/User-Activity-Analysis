import axios from "axios";
import React, { useEffect, useState } from "react";
import CategoryDistribution from "./Visualization/categoryDistribution";
import TimeSeriesChart from "./Visualization/time-series"
import { Card, StatCard } from "./visualization_cards";

import {Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement} from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const OverviewContent = () => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const sentimentData = [
       { name: "Positive", color: "#4CAF50" },
       { name: "Neutral", color: "#2196F3" },
       { name: "Negative", color: "#F44336" },
     ];
     useEffect(() => {
          axios
            .get(`${BASE_URL}/api/overview_dashboard`)
            .then((res) => {
              setData(res.data);
              console.log(res, res.data)
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error fetching Overview Dashboard data:", err);
              setError("Failed to fetch Overview Dashboard data");
              setLoading(false);
            });
        }, []);        
     const expandCategoryCounts = (countObj) => {
          return Object.entries(countObj).flatMap(([category, count]) =>
            Array(count).fill(category)
          );
        };
     if (loading || error) {
     return (
          <><div className="toast-overlay" />
          <div className={`toast-message ${error ? "error" : "processing"}`}>{error || "Loading Dashboard Overview..."}</div></>
     );
     }  
          
     return (
          <><h2 className="page-title">Your Smart Daily Snapshot – by COGNITIVE.AI</h2>
          <div className="cards-flex">
            <StatCard title="Date" value={data.predictionsToday.date} />
            <StatCard title="Emails Received Today" value={data.predictionsToday.total_emails} />
            <StatCard title="Meetings Today" value={data.predictionsToday.total_meetings} />
            <StatCard title="Night Emails Received" value={data.predictionsToday.night_emails} />
            <StatCard title="Negative Sentiment" value={data.predictionsToday.negative_sentiment_ratio} />
            <StatCard title="Urgency Score" value={data.predictionsToday.avg_urgency_score} />
            {data.burnout === 0 ? 
            (<div> <h2 style={{"color":"green", "fontFamily":"'Great Vibes', cursive", "fontSize":"30px"}}>Smooth Sailing – Low Workload Today</h2> </div>) : 
            (<div> <h2 style={{"color":"red", "fontFamily":"'Great Vibes', cursive", "fontSize":"30px"}}>⚠️ Burnout Risk – Heavy Cognitive Load</h2> </div>)}
          </div> <br></br>
          <h2 className="page-title">Dashboard Overview - Last 90 Days</h2>
          <div className="cards-flex">
            <StatCard title="Total Number of emails" value={data.total_emails} />
            <StatCard title="Toal Number of Ham Emails" value={data.spam_categories.ham} />
            <StatCard title="Total Meetings" value={data.total_meetings} />
          </div>
          <div className="dashboard-grid"> 
            <TimeSeriesChart dataPoints={data.burnout_range} />
            <CategoryDistribution categories={expandCategoryCounts(data.spam_categories)} titleOut="Spam Categorization: Email Count by Categories" /> 
            <CategoryDistribution categories={expandCategoryCounts(data.meeting_categories)} titleOut="Meeting Categorization : Email Count by Categories" />
            <CategoryDistribution categories={expandCategoryCounts(data.top_senders)} titleOut="Top Email Senders" doDrawPy="false" />
          </div>
          <Card title="Sentiment Analysis">
        <div className="sentiment-container">
          {sentimentData.map((item) => (
            <div key={item.name} className="sentiment-item">
              <div className="sentiment-icon" style={{ backgroundColor: item.color }}>
                {item.name === "Positive" && <span>😃</span>}
                {item.name === "Neutral" && <span>😐</span>}
                {item.name === "Negative" && <span>😞</span>}
              </div>
              <div className="sentiment-details">
                <h3 className="sentiment-title">{item.name}</h3>
                <p className="sentiment-count">{data.sentiment_details?.[item.name] ?? 0}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      </>
     );
};

export default OverviewContent;