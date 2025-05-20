import React from "react";
import Plot from "react-plotly.js";
import { Card } from "../visualization_cards";

const TimeSeriesChart = ({ dataPoints }) => {
  const today = new Date();

  const dateLabels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  return (
    <Card title={"Burnout Prediction - Past 30 Days"}>
      <Plot
        data={[
          {
            x: dateLabels,
            y: [...dataPoints].reverse(),
            type: "scatter",
            mode: "lines+markers",
            name: "Burnout Score",
            line: { color: "blue", width: 2 },
            marker: { color: "blue", size: 6 },
            hoverinfo: "x+y",
          },
        ]}
        layout={{
          xaxis: {
            title: { text: "Date" },
            tickangle: -45,
            showgrid: true,
            gridcolor: "#eee",
            tickfont: { size: 12 },
          },
          yaxis: {
            title: { text: "Burnout Score" },
            dtick: 1,
            range: [0, 2],
            showgrid: true,
            gridcolor: "#ddd",
            tickfont: { size: 12 },
          },
          hovermode: "x unified",
          margin: { l: 50, r: 30, b: 80, t: 60 },
          legend: {
            orientation: "h",
            x: 0.5,
            y: -0.2,
            xanchor: "center",
            title: { text: "" },
          },
          width: 800,
          height: 300,
        }}
        config={{ responsive: true }}
      />
    </Card>
  );
};

export default TimeSeriesChart;