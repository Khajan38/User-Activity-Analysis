import React from "react";
import Plot from "react-plotly.js";
import { Card } from "./../visualization_cards";

export default function StripPlot({ data, classNames, bestThresholds }) {
  const jitterAmount = 0.2;
  const correctPoints = data.filter((d) => d.correct);
  const incorrectPoints = data.filter((d) => !d.correct);
  const applyJitter = (cls) => {
    const base = classNames.indexOf(cls);
    return base + (Math.random() - 0.5) * jitterAmount;
  };
  const jitteredCorrect = {
    x: correctPoints.map((d) => applyJitter(d.class)),
    y: correctPoints.map((d) => d.probability),
    mode: "markers",
    type: "scatter",
    name: "Correct",
    marker: { color: "green", size: 8, opacity: 0.6 },
    hoverinfo: "y",
  };
  const jitteredIncorrect = {
    x: incorrectPoints.map((d) => applyJitter(d.class)),
    y: incorrectPoints.map((d) => d.probability),
    mode: "markers",
    type: "scatter",
    name: "Incorrect",
    marker: { color: "red", size: 8, opacity: 0.6 },
    hoverinfo: "y",
  };

  const thresholdLines = Object.entries(bestThresholds).map(([className, threshold]) => {
    const xIndex = classNames.indexOf(className);
    if (xIndex === -1) return null;
    const xmin = xIndex - 0.4;
    const xmax = xIndex + 0.4;
    return {type: "line", xref: "x", yref: "y", x0: xmin, x1: xmax, y0: threshold, y1: threshold, line: {color: "blue", width: 2, dash: "dash" }};
  }).filter(Boolean);

  return (
    <Card title={"Predicted Probabilities Scatter Plot"}>
      <Plot
        data={[jitteredCorrect, jitteredIncorrect]}
        layout={{
          showlegend: true,
          width: 800, height: 500,
          xaxis: {
            title: {text: "Class"},
            tickvals: classNames.map((_, i) => i),
            ticktext: classNames,
          },
          yaxis: {
            title: {text: "Predicted Probability"},
            range: [0, 1],
            gridcolor: '#ccc',
            gridwidth: 1,
          },
          shapes: thresholdLines,
          margin: { l: 50, r: 30, b: 80, t: 50 },
          legend: {
            title: { text: "Correct Prediction" },
            orientation: "h",
            x: 0.5,
            y: -0.2,
            xanchor: "center"
          }
        }}
        config={{ responsive: true }}
      />
    </Card>
  );
}
