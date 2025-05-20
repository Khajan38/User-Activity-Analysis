import "./../CSS/visualization.css";
import { Bar, Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Card } from "../visualization_cards";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

export default function CategoryDistribution({ categories, titleOut, doDrawPy = true }) {
  const labels = [...new Set(categories)];
  const backgroundColor = [
    "rgba(33, 150, 243, 0.7)",
    "rgba(179, 229, 252, 0.7)",
    "rgba(0, 121, 191, 0.7)",
    "rgba(0, 72, 128, 0.7)",
    "rgba(66, 165, 245, 0.7)",
    "rgba(100, 181, 246, 0.7)",
    "rgba(25, 118, 210, 0.7)",
    "rgba(13, 71, 161, 0.7)",
    "rgba(1, 87, 155, 0.7)",
    "rgba(144, 202, 249, 0.7)"
  ];
  const counts = labels.map((label) => categories.filter((c) => c === label).length);
  const data = {labels, datasets: [{label: "Email Count", data: counts, backgroundColor},],};

  const options = {
    indexAxis: "y", 
    plugins: {
      datalabels: {anchor: "end", align: "end", color: "#333", font: {weight: "bold",}, formatter: (value) => value},
      legend: {display: false},
      title: {display: false}
    },
    responsive: true, 
    maintainAspectRatio: false,
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {position: "top"}, 
      tooltip: {callbacks: {label: (tooltipItem) => {return `${tooltipItem.label}: ${tooltipItem.raw} emails`;}}},
      datalabels: { formatter: (value, context) => {
        const percentage = ((value / context.chart._metasets[0].total) * 100).toFixed(2);
        return `${percentage}%`;
        },
      color: "#000000",
      },
    },
  };
  return (
    (doDrawPy === true? (<Card title={titleOut}>
        <div className="bar-chart-container-200"><Bar data={data} options={options} /></div>
        <div className="plot-chart-container"><Pie data={data} options={pieOptions} /></div>
    </Card>) : (<Card title={titleOut}> 
      <div className="bar-chart-container-500"><Bar data={data} options={options} /></div>
    </Card>))
  );
}