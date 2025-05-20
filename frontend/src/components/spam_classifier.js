import axios from "axios";
import React, { useEffect, useState } from "react";
import CategoryDistribution from "./Visualization/categoryDistribution";
import ConfusionMatrix from "./Visualization/confusionMatrix";
import ROCCurve from "./Visualization/rocCurve";
import StripPlot from "./Visualization/stripPlot";
import { StatCard } from "./visualization_cards";

import {Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement} from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SpamModel = () => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     useEffect(() => {
          axios
            .get(`${BASE_URL}/api/spam_classifier`)
            .then((res) => {
              setData(res.data);
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error fetching spam dashboard data:", err);
              setError("Failed to fetch spam dashboard data");
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
          <div className={`toast-message ${error ? "error" : "processing"}`}>{error || "Loading spam insights..."}</div></>
     );
     }        
          
     return (
          <><h2 className="page-title">Spam Classifier - Multinomial NB</h2>
          <div className="cards-flex">
               <StatCard title="Data-Frame Emails Analyzed" value={data.total_emails} />
               <StatCard title="Model Accuracy" value={`${(data.accuracy * 100).toFixed(2)}%`} />
               <StatCard title="Model Precision" value={data.classification_report["macro avg"]["precision"].toFixed(5)} />
               <StatCard title="Model Recall" value={data.classification_report["macro avg"]["recall"].toFixed(5)} />
               <StatCard title="Model F1-Score" value={data.classification_report["macro avg"]["f1-score"].toFixed(5)} />
          </div>
          <section className="model-description">
               <h3>ABOUT</h3> <br></br>
               <p>
                    This spam classifier is built using a custom implementation of the <strong>Multinomial Naive Bayes</strong> algorithm. 
                    It has been trained on a labeled email dataset to distinguish between spam and non-spam (ham) emails. The performance metrics below are calculated using test data and help evaluate model quality.
               </p><br></br>
               <p>
                    Dataset Source: <a href="https://github.com/Khajan38/User-Activity-Analysis/blob/main/dependencies/emails_dataset.csv" target="_blank" rel="noreferrer">SMS Spam Collection Dataset - UCI</a>
               </p><br></br>
               <h4>CLASSIFICATION REPORT</h4>
               <table className="classification-table">
                    <thead><tr><th>Label</th><th>Precision</th><th>Recall</th><th>F1-Score</th><th>Support</th></tr></thead>
                    <tbody>
                    {Object.entries(data.classification_report).map(([label, metrics]) => {
                         if (typeof metrics !== 'object' || metrics.precision === undefined) return null;
                         return (
                              <tr key={label}>
                                   <td>{label}</td>
                                   <td>{metrics.precision.toFixed(4)}</td>
                                   <td>{metrics.recall.toFixed(4)}</td>
                                   <td>{metrics["f1-score"].toFixed(4)}</td>
                                   <td>{metrics.support}</td>
                              </tr>
                         );
                    })}
                    </tbody>
               </table>
          </section>
          <div className="dashboard-grid"> 
               <CategoryDistribution categories={expandCategoryCounts(data.train_counts)} titleOut="Train Dataset : Email Count by Categories" /> 
               <CategoryDistribution categories={expandCategoryCounts(data.test_counts)} titleOut="Test Dataset : Email Count by Categories" /> 
               <ConfusionMatrix matrix={data.confusion_matrix} labels={data.standard_class_order} accuracy={data.accuracy}/>
               <ROCCurve rocData={data.roc_data} best_thresholds={data.best_thresholds} />
               <StripPlot data={data.probability_data} classNames={data.standard_class_order} bestThresholds={data.best_thresholds}/> 
          </div>
          </>
     );
};

export default SpamModel;