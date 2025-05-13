import "./../CSS/visualization.css";
import { Bar, Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Card } from "../visualization_cards";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

export default function CategoryDistribution({ categories, titleOut }) {
  const labels = [...new Set(categories)];
  const backgroundColor = [
    "rgba(33, 150, 243, 0.7)",  // Light Blue
    "rgba(179, 229, 252, 0.7)", // Light blue
    "rgba(33, 150, 243, 0.7)",  // Medium blue
    "rgba(0, 121, 191, 0.7)",   // Dark blue
    "rgba(224, 242, 255, 0.7)", // Very light blue
    "rgba(0, 72, 128, 0.7)"      // Very dark blue (high value)
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
    <Card title={titleOut}>
        <div className="bar-chart-container"><Bar data={data} options={options} /></div>
        <div className="plot-chart-container"><Pie data={data} options={pieOptions} /></div>
    </Card>
  );
}